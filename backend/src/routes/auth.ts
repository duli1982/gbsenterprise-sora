import { Router, Request, Response } from 'express';

const router = Router();

router.get('/profile', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  if (authHeader !== 'Bearer dev-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({ id: 'user1', email: 'user@example.com' });
});

export default router;
