import { Router, Request, Response } from 'express';
import db from '../db/firestore';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/modules', authenticate, async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('modules').get();
    const modules = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    res.json(modules);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
});

export default router;
