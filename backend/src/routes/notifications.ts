import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import db from '../db/firestore';
import admin from 'firebase-admin';
import { Notification, NotificationPreferences } from '../types/notification';

const router = Router();

let sgMail: any;
try {
  sgMail = require('@sendgrid/mail');
} catch {
  sgMail = {
    setApiKey: () => {},
    send: async () => {},
  };
}

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const snapshot = await db
      .collection('notifications')
      .where('userId', '==', req.user!.id)
      .orderBy('createdAt', 'desc')
      .get();
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
    res.json(notifications);
  } catch {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

router.post('/send', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  const { userId, title, message } = req.body;
  if (!userId || !message) {
    return res.status(400).json({ message: 'Missing userId or message' });
  }
  const notif: Notification = {
    userId,
    title: title || 'Notification',
    message,
    read: false,
    createdAt: Date.now(),
  };
  try {
    const docRef = await db.collection('notifications').add(notif);
    const prefDoc = await db.collection('notificationPreferences').doc(userId).get();
    const prefs: NotificationPreferences = prefDoc.exists ? (prefDoc.data() as any) : {};
    if (prefs.email !== false && process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL) {
      try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        await sgMail.send({
          to: prefs.emailAddress,
          from: process.env.SENDGRID_FROM_EMAIL,
          subject: notif.title,
          text: notif.message,
        });
      } catch (err) {
        console.error('SendGrid error', err);
      }
    }
    if (prefs.push !== false && prefs.pushToken) {
      try {
        await admin.messaging().send({
          token: prefs.pushToken,
          notification: { title: notif.title, body: notif.message },
        });
      } catch (err) {
        console.error('FCM error', err);
      }
    }
    res.status(201).json({ id: docRef.id });
  } catch {
    res.status(500).json({ message: 'Failed to send notification' });
  }
});

router.get('/preferences', authenticate, async (req: Request, res: Response) => {
  const prefDoc = await db.collection('notificationPreferences').doc(req.user!.id).get();
  res.json(prefDoc.exists ? prefDoc.data() : {});
});

router.put('/preferences', authenticate, async (req: Request, res: Response) => {
  await db
    .collection('notificationPreferences')
    .doc(req.user!.id)
    .set(req.body, { merge: true });
  res.status(204).send();
});

router.patch('/:id/read', authenticate, async (req: Request, res: Response) => {
  await db.collection('notifications').doc(req.params.id).update({ read: true });
  res.json({ id: req.params.id });
});

export default router;

