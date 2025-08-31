import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { searchModules, suggestModules, indexModulesFromFirestore } from '../search/cloudSearch';

const router = Router();

indexModulesFromFirestore().catch(err => {
  console.error('Failed to index modules', err);
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const q = ((req.query.q as string) || '').trim();
    const results = await searchModules(q);
    res.json(results);
  } catch (err) {
    console.error('Search failed', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

router.get('/suggestions', authenticate, async (req: Request, res: Response) => {
  try {
    const q = ((req.query.q as string) || '').trim();
    const suggestions = await suggestModules(q);
    res.json(suggestions);
  } catch (err) {
    console.error('Suggestion lookup failed', err);
    res.status(500).json({ error: 'Suggestion lookup failed' });
  }
});

export default router;
