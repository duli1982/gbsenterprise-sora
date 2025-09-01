import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../types/user';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
    const ticket = await client.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const role = ((payload as unknown as Record<string, unknown>).role as User['role']) || 'user';
    req.user = {
      id: payload.sub || '',
      email: payload.email || '',
      name: payload.name || '',
      picture: payload.picture,
      role,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
