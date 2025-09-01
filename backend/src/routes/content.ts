import { Router, Request, Response } from 'express';
import db from '../db/firestore';
import { authenticate } from '../middleware/auth';

const router = Router();

interface Module {
  id: string;
  title: string;
  description: string;
}

router.get('/modules', authenticate, async (_req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('modules').get();
    const modules: Module[] = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Module, 'id'>) }));
    res.json(modules);
  } catch {
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
});

export default router;
