const http = require('http');

const modules = [
  { id: '1', title: 'Intro to GBS', description: 'Welcome module' },
  { id: '2', title: 'Advanced Processes', description: 'Deep dive' }
];

function auth(req, res) {
  const authHeader = req.headers['authorization'];
  if (authHeader === 'Bearer dev-token') {
    return true;
  }
  res.writeHead(401, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Unauthorized' }));
  return false;
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/content/modules') {
    if (!auth(req, res)) return;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(modules));
    return;
  }

  if (req.method === 'GET' && req.url === '/auth/profile') {
    if (!auth(req, res)) return;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ id: 'user1', email: 'user@example.com' }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = process.env.PORT || 3001;

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = server;
