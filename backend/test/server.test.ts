import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';

// Mock Google token verification
import * as googleAuth from '../src/auth/google';
(googleAuth as any).verifyIdToken = async (token: string) => {
  if (token === 'valid-token') {
    return { sub: 'user1', email: 'user@example.com', name: 'Test User' } as any;
  }
  if (token === 'admin-token') {
    return { sub: 'admin1', email: 'admin@example.com', name: 'Admin User', role: 'admin' } as any;
  }
  throw new Error('Invalid token');
};

// Mock Firestore collection fetching
import db from '../src/db/firestore';
const modules = [
  { id: '1', data: () => ({ title: 'Intro to GBS', description: 'Welcome module' }) },
  { id: '2', data: () => ({ title: 'Advanced Processes', description: 'Deep dive' }) },
];
const notifications: any[] = [];
const preferences: Record<string, any> = {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(db as any).collection = (name: string) => {
  if (name === 'modules') {
    return { get: async () => ({ docs: modules }) };
  }
  if (name === 'notifications') {
    return {
      where: () => ({
        orderBy: () => ({
          get: async () => ({
            docs: notifications.map((n, idx) => ({ id: String(idx + 1), data: () => n })),
          }),
        }),
      }),
      add: async (data: any) => {
        notifications.push({ ...data });
        return { id: String(notifications.length) };
      },
      doc: (id: string) => ({
        update: async (data: any) => {
          const index = Number(id) - 1;
          if (notifications[index]) notifications[index] = { ...notifications[index], ...data };
        },
      }),
    };
  }
  if (name === 'notificationPreferences') {
    return {
      doc: (id: string) => ({
        get: async () => ({ exists: preferences[id] !== undefined, data: () => preferences[id] }),
        set: async (data: any) => {
          preferences[id] = { ...(preferences[id] || {}), ...data };
        },
      }),
    };
  }
  return {};
};

// Mock BigQuery for analytics
import bigquery from '../src/db/bigquery';
const insertedRows: any[] = [];
(bigquery as any).dataset = () => ({
  table: () => ({
    insert: async (rows: any[]) => {
      insertedRows.push(...rows);
    },
  }),
});
(bigquery as any).query = async () => [[{ moduleId: '1', avgProgress: 50, totalEvents: '1' }]];

// Mock Firebase messaging
import admin from 'firebase-admin';
const sentPush: any[] = [];
Object.defineProperty(admin, 'messaging', {
  value: () => ({
    send: async (msg: any) => {
      sentPush.push(msg);
    },
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

function makeRequest(path: string, token?: string, method = 'GET', body?: any): Promise<ResponseData> {
  return new Promise((resolve, reject) => {
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    let payload: string | undefined;
    if (body) {
      payload = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(payload).toString();
    }

    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers,
    };

    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode ?? 0, body: data }));
    });

    req.on('error', reject);
    if (payload) req.write(payload);
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

test('records progress events', async () => {
  insertedRows.length = 0;
  const res = await makeRequest(
    '/analytics/progress',
    'valid-token',
    'POST',
    { moduleId: '1', progress: 80 }
  );
  assert.strictEqual(res.status, 201);
  assert.strictEqual(insertedRows.length, 1);
  assert.strictEqual(insertedRows[0].moduleId, '1');
  assert.strictEqual(insertedRows[0].userId, 'user1');
});

test('returns dashboard summary', async () => {
  const res = await makeRequest('/analytics/dashboard', 'valid-token');
  assert.strictEqual(res.status, 200);
  const data = JSON.parse(res.body);
  assert.ok(Array.isArray(data));
  assert.strictEqual(data[0].moduleId, '1');
});

test('search returns matching modules', async () => {
  const res = await makeRequest('/search?q=Intro', 'valid-token');
  assert.strictEqual(res.status, 200);
  const data = JSON.parse(res.body);
  assert.strictEqual(data.length, 1);
  assert.strictEqual(data[0].title, 'Intro to GBS');
});

test('search suggestions return titles', async () => {
  const res = await makeRequest('/search/suggestions?q=Ad', 'valid-token');
  assert.strictEqual(res.status, 200);
  const data = JSON.parse(res.body);
  assert.deepStrictEqual(data, ['Advanced Processes']);
});

test('send and list notifications', async () => {
  const resSend = await makeRequest('/notifications/send', 'admin-token', 'POST', {
    userId: 'user1',
    title: 'Hello',
    message: 'Test message',
  });
  assert.strictEqual(resSend.status, 201);
  const resList = await makeRequest('/notifications', 'valid-token');
  assert.strictEqual(resList.status, 200);
  const data = JSON.parse(resList.body);
  assert.strictEqual(data.length, 1);
  assert.strictEqual(data[0].message, 'Test message');
});

test('update preferences and mark notification read', async () => {
  let res = await makeRequest('/notifications/preferences', 'valid-token', 'PUT', {
    email: false,
    push: true,
    pushToken: 'token',
    emailAddress: 'user@example.com',
  });
  assert.strictEqual(res.status, 204);
  res = await makeRequest('/notifications/preferences', 'valid-token');
  assert.strictEqual(res.status, 200);
  const prefs = JSON.parse(res.body);
  assert.strictEqual(prefs.email, false);
  const list = await makeRequest('/notifications', 'valid-token');
  const id = JSON.parse(list.body)[0].id;
  const readRes = await makeRequest(`/notifications/${id}/read`, 'valid-token', 'PATCH');
  assert.strictEqual(readRes.status, 200);
  const list2 = await makeRequest('/notifications', 'valid-token');
  const notif = JSON.parse(list2.body)[0];
  assert.strictEqual(notif.read, true);
});

