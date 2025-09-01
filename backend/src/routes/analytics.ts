import { Router, Request, Response } from 'express';
import db from '../db/firestore';
import bigquery from '../db/bigquery';
import { authenticate } from '../middleware/auth';

const router = Router();

const ANALYTICS_DATASET = 'analytics';
const EVENTS_TABLE = 'events';

// Store a completed module in Firestore
router.post('/progress/complete', authenticate, async (req: Request, res: Response) => {
  const { moduleId } = req.body as { moduleId?: string };
  if (!moduleId) {
    return res.status(400).json({ error: 'moduleId required' });
  }

  try {
    await db.collection('progress').add({
      userId: req.user?.id,
      moduleId,
      completedAt: new Date().toISOString(),
    });
    res.status(201).json({ status: 'ok' });
  } catch (err) {
    console.error('Failed to store progress', err);
    res.status(500).json({ error: 'Failed to store progress' });
  }
});

// Fetch progress for a given user
router.get('/progress/user/:userId', authenticate, async (req: Request, res: Response) => {
  try {
    const snapshot = await db
      .collection('progress')
      .where('userId', '==', req.params.userId)
      .get();
    const progress = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Record<string, unknown>) }));
    res.json(progress);
  } catch (err) {
    console.error('Failed to fetch progress', err);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Generic event ingestion for analytics
router.post('/analytics/events', authenticate, async (req: Request, res: Response) => {
  const { eventType, moduleId, metadata } = req.body as {
    eventType?: string;
    moduleId?: string;
    metadata?: Record<string, unknown>;
  };

  if (!eventType) {
    return res.status(400).json({ error: 'eventType required' });
  }

  try {
    const rows = [
      {
        userId: req.user?.id,
        eventType,
        moduleId,
        metadata,
        timestamp: new Date().toISOString(),
      },
    ];
    await bigquery.dataset(ANALYTICS_DATASET).table(EVENTS_TABLE).insert(rows);
    res.status(201).json({ status: 'ok' });
  } catch (err) {
    console.error('Failed to store event', err);
    res.status(500).json({ error: 'Failed to store event' });
  }
});

// Simple dashboard summarising events by type/module
router.get('/analytics/dashboard', authenticate, async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT eventType, moduleId, COUNT(*) as total
      FROM \`${ANALYTICS_DATASET}.${EVENTS_TABLE}\`
      GROUP BY eventType, moduleId
    `;
    const [rows] = await bigquery.query({ query, useLegacySql: false });
    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch dashboard', err);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

export default router;

