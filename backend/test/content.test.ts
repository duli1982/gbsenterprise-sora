import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { OAuth2Client } from 'google-auth-library';
import db from '../src/db/firestore';
import app from '../src/index';

// Mock token verification
(OAuth2Client.prototype as any).verifyIdToken = async ({ idToken }: { idToken: string }) => {
  if (idToken === 'valid-token') {
    return {
      getPayload: () => ({ sub: 'user1', email: 'user@example.com', name: 'Test User' }),
    } as any;
  }
  throw new Error('Invalid token');
};

// Mock Firestore modules collection
const modules = [
  { id: '1', data: () => ({ title: 'Intro', description: 'Welcome module' }) },
  { id: '2', data: () => ({ title: 'Advanced', description: 'Deep dive' }) },
];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(db as any).collection = (name: string) => {
  if (name === 'modules') {
    return { get: async () => ({ docs: modules }) };
  }
  return {};
};

const PORT = 4002;
let server: http.Server;

interface ResponseData {
  status: number;
  body: string;
}

function makeRequest(path: string, token?: string): Promise<ResponseData> {
  return new Promise((resolve, reject) => {
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method: 'GET',
      headers,
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

test('requires auth for modules', async () => {
  const res = await makeRequest('/content/modules');
  assert.strictEqual(res.status, 401);
});

test('returns modules when authorized', async () => {
  const res = await makeRequest('/content/modules', 'valid-token');
  assert.strictEqual(res.status, 200);
  const data = JSON.parse(res.body);
  assert.ok(Array.isArray(data));
  assert.strictEqual(data.length, 2);
  assert.strictEqual(data[0].title, 'Intro');
});
