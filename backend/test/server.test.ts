import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';

// Mock Google token verification
import * as googleAuth from '../src/auth/google';
(googleAuth as any).verifyIdToken = async (token: string) => {
  if (token === 'valid-token') {
    return { sub: 'user1', email: 'user@example.com', name: 'Test User' } as any;
  }
  throw new Error('Invalid token');
};

// Mock Firestore collection fetching
import db from '../src/db/firestore';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(db as any).collection = () => ({
  get: async () => ({
    docs: [
      { id: '1', data: () => ({ title: 'Intro to GBS', description: 'Welcome module' }) },
      { id: '2', data: () => ({ title: 'Advanced Processes', description: 'Deep dive' }) },
    ],
  }),
});

// Import the Express app
import app from '../src/index';

const PORT = 4000;
let server: http.Server;

interface ResponseData {
  status: number;
  body: string;
}

function makeRequest(path: string, token?: string, method = 'GET'): Promise<ResponseData> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    };

    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode ?? 0, body: data }));
    });

    req.on('error', reject);
    req.end();
  });
}

test.before(async () => {
  server = app.listen(PORT);
  await new Promise(resolve => server.once('listening', resolve));
});

test.after(async () => {
  await new Promise(resolve => server.close(resolve));
});

test('requires auth', async () => {
  const res = await makeRequest('/content/modules');
  assert.strictEqual(res.status, 401);
});

test('rejects invalid token', async () => {
  const res = await makeRequest('/content/modules', 'invalid-token');
  assert.strictEqual(res.status, 401);
});

test('returns modules when authorized', async () => {
  const res = await makeRequest('/content/modules', 'valid-token');
  assert.strictEqual(res.status, 200);
  const data = JSON.parse(res.body);
  assert.ok(Array.isArray(data));
  assert.strictEqual(data.length, 2);
});

test('returns user profile', async () => {
  const res = await makeRequest('/auth/profile', 'valid-token');
  assert.strictEqual(res.status, 200);
  const data = JSON.parse(res.body);
  assert.strictEqual(data.email, 'user@example.com');
});

test('requires auth for profile', async () => {
  const res = await makeRequest('/auth/profile');
  assert.strictEqual(res.status, 401);
});

test('rejects profile with invalid token', async () => {
  const res = await makeRequest('/auth/profile', 'invalid-token');
  assert.strictEqual(res.status, 401);
});

test('login returns url', async () => {
  const res = await makeRequest('/auth/login', undefined, 'POST');
  assert.strictEqual(res.status, 200);
  const data = JSON.parse(res.body);
  assert.ok(data.url);
});

