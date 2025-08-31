const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const server = require('../server');

const PORT = 4000;

function makeRequest(path, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

test.before(async () => {
  await new Promise(resolve => server.listen(PORT, resolve));
});

test.after(async () => {
  await new Promise(resolve => server.close(resolve));
});

test('requires auth', async () => {
  const res = await makeRequest('/content/modules');
  assert.strictEqual(res.status, 401);
});

test('returns modules when authorized', async () => {
  const res = await makeRequest('/content/modules', 'dev-token');
  assert.strictEqual(res.status, 200);
  const data = JSON.parse(res.body);
  assert.ok(Array.isArray(data));
  assert.strictEqual(data.length, 2);
});
