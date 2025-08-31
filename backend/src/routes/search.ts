import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { searchModules, suggestModules, indexModulesFromFirestore } from '../search/cloudSearch';

const router = Router();

indexModulesFromFirestore().catch(err => {
  console.error('Failed to index modules', err);
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  const q = (req.query.q as string) || '';
  const results = await searchModules(q);
  res.json(results);
});

router.get('/suggestions', authenticate, async (req: Request, res: Response) => {
  const q = (req.query.q as string) || '';
  const suggestions = await suggestModules(q);
  res.json(suggestions);
});

export default router;
