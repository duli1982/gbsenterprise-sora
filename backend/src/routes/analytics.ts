import { Router, Request, Response } from 'express';
import bigquery from '../db/bigquery';
import { authenticate } from '../middleware/auth';

const router = Router();

// Generic event ingestion for future analytics dashboards
router.post('/events', authenticate, async (req: Request, res: Response) => {
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
    await bigquery.dataset('analytics').table('events').insert(rows);
    res.status(201).json({ status: 'ok' });
  } catch {
    res.status(500).json({ error: 'Failed to store event' });
  }
});

// Specific endpoint for tracking module progress
router.post('/progress', authenticate, async (req: Request, res: Response) => {
  const { moduleId, progress } = req.body as { moduleId?: string; progress?: number };
  if (!moduleId || typeof progress !== 'number') {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  try {
    const rows = [
      {
        userId: req.user?.id,
        moduleId,
        progress,
        eventType: 'progress',
        timestamp: new Date().toISOString(),
      },
    ];

    await bigquery.dataset('analytics').table('events').insert(rows);
    res.status(201).json({ status: 'ok' });
  } catch {
    res.status(500).json({ error: 'Failed to store event' });
  }
});

// Aggregated progress dashboard
router.get('/dashboard', authenticate, async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT moduleId, AVG(progress) as avgProgress, COUNT(*) as totalEvents
      FROM \`analytics.events\`
      WHERE eventType = 'progress'
      GROUP BY moduleId
    `;
    const [rows] = await bigquery.query({ query, useLegacySql: false });
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

// Summary endpoint aggregating events by type
router.get('/summary', authenticate, async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT eventType, moduleId, COUNT(*) as total
      FROM \`analytics.events\`
      GROUP BY eventType, moduleId
    `;
    const [rows] = await bigquery.query({ query, useLegacySql: false });
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

export default router;
