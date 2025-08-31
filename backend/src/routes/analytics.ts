import { Router, Request, Response } from 'express';
import bigquery from '../db/bigquery';
import { authenticate } from '../middleware/auth';

const router = Router();

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
        timestamp: new Date().toISOString(),
      },
    ];

    await bigquery.dataset('analytics').table('events').insert(rows);
    res.status(201).json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to store event' });
  }
});

router.get('/dashboard', authenticate, async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT moduleId, AVG(progress) as avgProgress, COUNT(*) as totalEvents
      FROM \`analytics.events\`
      GROUP BY moduleId
    `;
    const [rows] = await bigquery.query({ query, useLegacySql: false });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

export default router;
