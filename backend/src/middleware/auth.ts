import { Request, Response, NextFunction } from 'express';
import { verifyIdToken } from '../auth/google';
import { User } from '../types/user';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing Authorization header' });
  }

  const token = authHeader.substring('Bearer '.length);

  try {
    const payload = await verifyIdToken(token);
    if (!payload) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = {
      id: payload.sub || '',
      email: payload.email || '',
      name: payload.name || '',
      picture: payload.picture,
      role: (payload['role'] as User['role']) || 'user',
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
