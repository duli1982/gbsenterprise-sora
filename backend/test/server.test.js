const test = require('node:test');
const assert = require('node:assert');
const http = require('http');

// Mock Google token verification
const googleAuth = require('../dist/auth/google.js');
googleAuth.verifyIdToken = async token => {
  if (token === 'valid-token') {
    return { sub: 'user1', email: 'user@example.com', name: 'Test User' };
  }
  throw new Error('Invalid token');
};

const db = require('../dist/db/firestore.js').default;
// Mock Firestore collection fetching
db.collection = () => ({
  get: async () => ({
    docs: [
      { id: '1', data: () => ({ title: 'Intro to GBS', description: 'Welcome module' }) },
      { id: '2', data: () => ({ title: 'Advanced Processes', description: 'Deep dive' }) },
    ],
  }),
});

const app = require('../dist/index.js').default;

const PORT = 4000;
let server;

function makeRequest(path, token, method = 'GET') {
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
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
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

test('login returns url', async () => {
  const res = await makeRequest('/auth/login', undefined, 'POST');
  assert.strictEqual(res.status, 200);
  const data = JSON.parse(res.body);
  assert.ok(data.url);
});
