import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/profile', authenticate, (req: Request, res: Response) => {
  res.json(req.user);
});

export default router;
