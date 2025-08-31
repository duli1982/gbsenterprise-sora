import { Router, Request, Response } from 'express';
import db from '../db/firestore';

const router = Router();

router.get('/modules', async (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  if (authHeader !== 'Bearer dev-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const snapshot = await db.collection('modules').get();
    const modules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(modules);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
});

export default router;
