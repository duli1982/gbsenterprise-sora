import request from 'supertest';
import { OAuth2Client } from 'google-auth-library';
import app from '../src/index';

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret';
  process.env.GOOGLE_CLIENT_ID = 'client-id';
  process.env.GOOGLE_CLIENT_SECRET = 'client-secret';
  process.env.GOOGLE_REDIRECT_URI = 'http://localhost/auth/callback';
});

describe('Auth flow', () => {
  let refreshToken: string;
  let accessToken: string;

  it('returns Google auth URL', async () => {
    const res = await request(app).post('/auth/login').send();
    expect(res.status).toBe(200);
    expect(typeof res.body.url).toBe('string');
  });

  it('exchanges code and returns tokens', async () => {
    (OAuth2Client.prototype as any).getToken = async () => ({ tokens: { id_token: 'dev-token' } });
    (OAuth2Client.prototype as any).verifyIdToken = async () => ({
      getPayload: () => ({
        sub: '1',
        email: 'user@example.com',
        name: 'Test User',
      }),
    });
    const res = await request(app).post('/auth/callback').send({ code: 'test-code' });
    expect(res.status).toBe(200);
    expect(typeof res.body.accessToken).toBe('string');
    expect(typeof res.body.refreshToken).toBe('string');
    refreshToken = res.body.refreshToken;
    accessToken = res.body.accessToken;
  });

  it('refreshes access token', async () => {
    const res = await request(app).post('/auth/refresh').send({ refreshToken });
    expect(res.status).toBe(200);
    expect(typeof res.body.accessToken).toBe('string');
    accessToken = res.body.accessToken;
  });

  it('requires auth for profile', async () => {
    const unauth = await request(app).get('/auth/profile');
    expect(unauth.status).toBe(401);

    const auth = await request(app).get('/auth/profile').set('Authorization', `Bearer ${accessToken}`);
    expect(auth.status).toBe(200);
    expect(auth.body.email).toBe('user@example.com');
  });
});
