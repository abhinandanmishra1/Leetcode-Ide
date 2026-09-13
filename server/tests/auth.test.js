import { test, before, after } from 'node:test';
import assert from 'node:assert';
import { startServer, stopServer } from '../src/api/server.js';

let baseUrl;
let authToken;
let testUser;

before(async () => {
  const app = await startServer(0);
  const port = app.address().port;
  baseUrl = `http://localhost:${port}`;
});

after(async () => {
  await stopServer();
});

test('POST /auth/dev-login creates or logs in a dev user and returns JWT token', async () => {
  const res = await fetch(`${baseUrl}/auth/dev-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test_dev@codepad.local',
      name: 'Test Dev User',
    }),
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(data.token);
  assert.ok(data.user);
  assert.strictEqual(data.user.email, 'test_dev@codepad.local');
  assert.ok(data.user.username);
  assert.ok(data.user.id);

  authToken = data.token;
  testUser = data.user;
});

test('GET /auth/me without token returns 401 Unauthorized', async () => {
  const res = await fetch(`${baseUrl}/auth/me`);
  assert.strictEqual(res.status, 401);
});

test('GET /auth/me with valid Bearer token returns user profile and stats', async () => {
  const res = await fetch(`${baseUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.email, 'test_dev@codepad.local');
  assert.ok(data.stats);
  assert.strictEqual(typeof data.stats.snippets, 'number');
  assert.strictEqual(typeof data.stats.followers, 'number');
  assert.strictEqual(typeof data.stats.following, 'number');
});

test('PUT /auth/profile updates user bio and valid username', async () => {
  const newUsername = `updated_${Date.now().toString().slice(-4)}`;
  const newBio = 'Building algorithms on CodePad!';

  const res = await fetch(`${baseUrl}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      username: newUsername,
      bio: newBio,
    }),
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.username, newUsername);
  assert.strictEqual(data.bio, newBio);
});

test('PUT /auth/profile rejects invalid username format', async () => {
  const res = await fetch(`${baseUrl}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      username: 'bad-username!',
    }),
  });

  assert.strictEqual(res.status, 400);
});

test('POST /auth/google without credential returns 400', async () => {
  const res = await fetch(`${baseUrl}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  assert.strictEqual(res.status, 400);
});
