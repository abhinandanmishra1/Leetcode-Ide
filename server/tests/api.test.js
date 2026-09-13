import { test, before, after } from 'node:test';
import assert from 'node:assert';
import { startServer, stopServer } from '../src/api/server.js';

let baseUrl;

before(async () => {
  const app = await startServer(0); // Port 0 assigns random available port
  const port = app.address().port;
  baseUrl = `http://localhost:${port}`;
});

after(async () => {
  await stopServer();
});

test('GET /health returns 200 OK', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status, 'ok');
});

test('GET /languages returns all 6 core languages', async () => {
  const res = await fetch(`${baseUrl}/languages`);
  assert.strictEqual(res.status, 200);
  const langs = await res.json();
  assert.strictEqual(langs.length, 6);
});

test('POST /submissions executes code synchronously with wait=true', async () => {
  const payload = {
    language_id: 63,
    source_code: Buffer.from('console.log("Sync output");').toString('base64'),
    stdin: '',
  };
  const res = await fetch(`${baseUrl}/submissions?wait=true&base64_encoded=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status.id, 3);
  assert.strictEqual(Buffer.from(data.stdout, 'base64').toString().trim(), 'Sync output');
});

test('POST /submissions returns token for polling when wait=false', async () => {
  const payload = {
    language_id: 71,
    source_code: Buffer.from('print(100 + 200)').toString('base64'),
    stdin: '',
  };
  const createRes = await fetch(`${baseUrl}/submissions?wait=false&base64_encoded=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  assert.strictEqual(createRes.status, 201);
  const { token } = await createRes.json();
  assert.ok(token);

  // Poll GET /submissions/:token
  let pollData = null;
  for (let i = 0; i < 20; i++) {
    const pollRes = await fetch(`${baseUrl}/submissions/${token}?base64_encoded=true`);
    if (pollRes.status === 200) {
      pollData = await pollRes.json();
      if (pollData.status && pollData.status.id >= 3) break;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  assert.strictEqual(pollData.status.id, 3);
  assert.strictEqual(Buffer.from(pollData.stdout, 'base64').toString().trim(), '300');
});
