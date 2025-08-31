import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { generateAuthUrl } from '../auth/google';

const router = Router();

router.get('/profile', authenticate, (req: Request, res: Response) => {
  res.json(req.user);
});

router.post('/login', (_req: Request, res: Response) => {
  const url = generateAuthUrl();
  res.json({ url });
});

export default router;
