import { Router, Request, Response } from 'express';

const router = Router();

const modules = [
  { id: '1', title: 'Intro to GBS', description: 'Welcome module' },
  { id: '2', title: 'Advanced Processes', description: 'Deep dive' }
];

router.get('/modules', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  if (authHeader !== 'Bearer dev-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json(modules);
});

export default router;
