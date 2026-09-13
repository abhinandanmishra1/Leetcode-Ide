import { test, before, after } from 'node:test';
import assert from 'node:assert';
import { startServer, stopServer } from '../src/api/server.js';

let baseUrl;
let userA;
let userB;
let tokenA;
let tokenB;

before(async () => {
  const app = await startServer(0);
  const port = app.address().port;
  baseUrl = `http://localhost:${port}`;

  const runId = Date.now();

  // Log in user A
  const resA = await fetch(`${baseUrl}/auth/dev-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `usera-${runId}@codepad.local`, name: 'Alice Algorithm' }),
  });
  const dataA = await resA.json();
  userA = dataA.user;
  tokenA = dataA.token;

  // Log in user B
  const resB = await fetch(`${baseUrl}/auth/dev-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `userb-${runId}@codepad.local`, name: 'Bob Binary' }),
  });
  const dataB = await resB.json();
  userB = dataB.user;
  tokenB = dataB.token;

  // Create a snippet authored by User A
  await fetch(`${baseUrl}/snippets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({
      title: 'Alice QuickSort',
      languageId: 63,
      languageName: 'JavaScript (Node.js)',
      code: 'function qs() { return []; }',
      isPublic: true,
    }),
  });
});

after(async () => {
  await stopServer();
});

test('GET /users/:username fetches user profile and correct stats', async () => {
  const res = await fetch(`${baseUrl}/users/${userA.username}`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.user.username, userA.username);
  assert.strictEqual(data.user.name, 'Alice Algorithm');
  assert.strictEqual(data.stats.snippets, 1);
  assert.strictEqual(data.stats.followers, 0);
  assert.strictEqual(data.stats.following, 0);
});

test('GET /users/:username/snippets returns public snippets authored by user', async () => {
  const res = await fetch(`${baseUrl}/users/${userA.username}/snippets`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data));
  assert.strictEqual(data.length, 1);
  assert.strictEqual(data[0].title, 'Alice QuickSort');
});

test('POST /users/:username/follow toggles follow and updates follower count', async () => {
  // User B follows User A
  const followRes = await fetch(`${baseUrl}/users/${userA.username}/follow`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  assert.strictEqual(followRes.status, 200);
  const followData = await followRes.json();
  assert.strictEqual(followData.following, true);
  assert.strictEqual(followData.followersCount, 1);

  // Check User A profile from User B perspective
  const profileRes = await fetch(`${baseUrl}/users/${userA.username}`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  const profileData = await profileRes.json();
  assert.strictEqual(profileData.isFollowing, true);
  assert.strictEqual(profileData.stats.followers, 1);

  // User B unfollows User A
  const unfollowRes = await fetch(`${baseUrl}/users/${userA.username}/follow`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  assert.strictEqual(unfollowRes.status, 200);
  const unfollowData = await unfollowRes.json();
  assert.strictEqual(unfollowData.following, false);
  assert.strictEqual(unfollowData.followersCount, 0);
});

test('POST /users/:username/follow rejects self-follow', async () => {
  const res = await fetch(`${baseUrl}/users/${userA.username}/follow`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert.strictEqual(res.status, 400);
});

test('GET /users/search finds users by search query', async () => {
  const res = await fetch(`${baseUrl}/users/search?q=alice`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data));
  assert.ok(data.some((u) => u.username === userA.username));
});
