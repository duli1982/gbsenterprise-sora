import test from 'node:test';
import assert from 'node:assert';
import { OAuth2Client } from 'google-auth-library';
import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '../src/middleware/auth';

// Mock verifyIdToken
(OAuth2Client.prototype as any).verifyIdToken = async ({ idToken }: { idToken: string }) => {
  if (idToken === 'valid-token') {
    return {
      getPayload: () => ({ sub: '1', email: 'user@example.com', name: 'Test User' }),
    } as any;
  }
  throw new Error('Invalid token');
};

test('authenticate passes with valid token', async () => {
  const req = { headers: { authorization: 'Bearer valid-token' } } as unknown as Request;
  const res = {} as Response;
  let called = false;
  await authenticate(req, res, () => { called = true; });
  assert.ok(called);
  assert.strictEqual(req.user?.email, 'user@example.com');
});

test('authenticate rejects invalid token', async () => {
  const req = { headers: { authorization: 'Bearer bad-token' } } as unknown as Request;
  let status = 0;
  let body: any;
  const res = {
    status(code: number) {
      status = code;
      return this;
    },
    json(data: any) {
      body = data;
      return this;
    },
  } as unknown as Response;
  let nextCalled = false;
  await authenticate(req, res, () => { nextCalled = true; });
  assert.strictEqual(status, 401);
  assert.strictEqual(nextCalled, false);
  assert.deepStrictEqual(body, { message: 'Invalid token' });
});
