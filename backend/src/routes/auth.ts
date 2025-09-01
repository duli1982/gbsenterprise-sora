import { Router, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { authenticate } from '../middleware/auth';
import { saveUser, getUser } from '../models/user';
import { User } from '../types/user';

const router = Router();
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const refreshTokens = new Set<string>();

router.post('/login', (_req: Request, res: Response) => {
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
  });
  res.json({ url });
});

router.post('/callback', async (req: Request, res: Response) => {
  const { code } = req.body as { code?: string };
  if (!code) {
    return res.status(400).json({ message: 'Missing code' });
  }
  try {
    const { tokens } = await client.getToken(code);
    const idToken = tokens.id_token;
    if (!idToken) {
      return res.status(400).json({ message: 'Missing id_token' });
    }
    const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    const user: User = {
      id: payload.sub,
      email: payload.email,
      name: payload.name || '',
      picture: payload.picture,
      role: (payload as any).role || 'user',
    };
    saveUser(user);
    const accessToken = jwt.sign(user, process.env.JWT_SECRET as string, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
    refreshTokens.add(refreshToken);
    res.json({ accessToken, refreshToken });
  } catch (err) {
    res.status(401).json({ message: 'Authentication failed' });
  }
});

router.post('/refresh', (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken || !refreshTokens.has(refreshToken)) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
  try {
    const { id } = jwt.verify(refreshToken, process.env.JWT_SECRET as string) as { id: string };
    const user = getUser(id);
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    const accessToken = jwt.sign(user, process.env.JWT_SECRET as string, { expiresIn: '15m' });
    res.json({ accessToken });
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

router.get('/profile', authenticate, (req: Request, res: Response) => {
  res.json(req.user);
});

router.post('/logout', (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (refreshToken) {
    refreshTokens.delete(refreshToken);
  }
  res.status(204).send();
});

export default router;
