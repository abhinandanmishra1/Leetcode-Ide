import { test, before, after } from 'node:test';
import assert from 'node:assert';
import { startServer, stopServer } from '../src/api/server.js';

let baseUrl;
let authorToken;
let otherToken;
let authorUserId;
let otherUserId;
const createdLearningIds = [];

const testRunId = Date.now();

before(async () => {
  const app = await startServer(0);
  const port = app.address().port;
  baseUrl = `http://localhost:${port}`;

  // Log in author user
  const authorRes = await fetch(`${baseUrl}/auth/dev-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `learning_author_${testRunId}@codepad.local`, name: 'Author Dev' }),
  });
  const authorData = await authorRes.json();
  authorToken = authorData.token;
  authorUserId = authorData.user.id;

  // Log in secondary user
  const otherRes = await fetch(`${baseUrl}/auth/dev-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `learning_other_${testRunId}@codepad.local`, name: 'Other Dev' }),
  });
  const otherData = await otherRes.json();
  otherToken = otherData.token;
  otherUserId = otherData.user.id;
});

after(async () => {
  if (createdLearningIds.length > 0) {
    try {
      const Learning = (await import('../src/db/models/Learning.js')).default;
      await Learning.deleteMany({ learningId: { $in: createdLearningIds } });
    } catch {}
  }
  await stopServer();
});

test('POST /learnings rejects unauthenticated requests', async () => {
  const res = await fetch(`${baseUrl}/learnings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Sliding Window Pattern',
      content: 'Maintain a window [left, right] over array.',
    }),
  });
  assert.strictEqual(res.status, 401);
});

test('POST /learnings validates required title and content', async () => {
  const res = await fetch(`${baseUrl}/learnings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authorToken}`,
    },
    body: JSON.stringify({
      title: '',
      content: '',
    }),
  });
  assert.strictEqual(res.status, 400);
});

test('POST /learnings creates a private note with author and nanoid learningId', async () => {
  const payload = {
    title: 'Two Pointers Pattern',
    content: '### Two Pointers\nUse two pointers left and right moving towards center.',
    tags: ['dsa', 'arrays', 'two-pointers'],
    relatedProblems: [
      {
        title: 'Two Sum II - Input Array Is Sorted',
        url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/',
        difficulty: 'Medium',
        problemNumber: '167',
      },
    ],
    visibility: 'private',
  };

  const res = await fetch(`${baseUrl}/learnings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authorToken}`,
    },
    body: JSON.stringify(payload),
  });

  assert.strictEqual(res.status, 201);
  const data = await res.json();
  assert.ok(data.learningId, 'learningId should be generated');
  assert.strictEqual(data.title, 'Two Pointers Pattern');
  assert.strictEqual(data.visibility, 'private');
  assert.strictEqual(data.isAuthor, true);
  assert.strictEqual(data.tags.length, 3);
  assert.strictEqual(data.relatedProblems.length, 1);
  assert.strictEqual(data.relatedProblems[0].difficulty, 'Medium');
  assert.strictEqual(data.author.id, authorUserId);

  createdLearningIds.push(data.learningId);
});

test('GET /learnings/me returns author notes and count metadata', async () => {
  const res = await fetch(`${baseUrl}/learnings/me`, {
    headers: { Authorization: `Bearer ${authorToken}` },
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.learnings));
  assert.ok(data.learnings.length >= 1);
  assert.ok(data.counts);
  assert.ok(data.counts.private >= 1);
  assert.strictEqual(data.learnings[0].isAuthor, true);
});

test('GET /learnings/me rejects unauthenticated requests', async () => {
  const res = await fetch(`${baseUrl}/learnings/me`);
  assert.strictEqual(res.status, 401);
});

test('GET /learnings/:learningId allows author to view private note', async () => {
  const learningId = createdLearningIds[0];
  const res = await fetch(`${baseUrl}/learnings/${learningId}`, {
    headers: { Authorization: `Bearer ${authorToken}` },
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.learningId, learningId);
  assert.strictEqual(data.isAuthor, true);
});

test('GET /learnings/:learningId blocks non-author from viewing private note (403 Forbidden)', async () => {
  const learningId = createdLearningIds[0];

  // Attempt with secondary authenticated user
  const otherRes = await fetch(`${baseUrl}/learnings/${learningId}`, {
    headers: { Authorization: `Bearer ${otherToken}` },
  });
  assert.strictEqual(otherRes.status, 403);
  const otherData = await otherRes.json();
  assert.strictEqual(otherData.error, 'Forbidden');

  // Attempt as guest (no token)
  const guestRes = await fetch(`${baseUrl}/learnings/${learningId}`);
  assert.strictEqual(guestRes.status, 403);
});

test('GET /learnings (explore feed) NEVER lists private notes', async () => {
  const learningId = createdLearningIds[0];
  const res = await fetch(`${baseUrl}/learnings`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();

  const found = data.learnings.some((item) => item.learningId === learningId);
  assert.strictEqual(found, false, 'Private note must not appear in public explore feed');
});

test('PUT /learnings/:learningId allows author to update note and toggle to unlisted', async () => {
  const learningId = createdLearningIds[0];

  const res = await fetch(`${baseUrl}/learnings/${learningId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authorToken}`,
    },
    body: JSON.stringify({
      title: 'Two Pointers Pattern (Updated)',
      visibility: 'unlisted',
      tags: ['dsa', 'arrays', 'two-pointers', 'patterns'],
    }),
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.title, 'Two Pointers Pattern (Updated)');
  assert.strictEqual(data.visibility, 'unlisted');
  assert.strictEqual(data.tags.length, 4);
});

test('GET /learnings/:learningId allows anyone to view unlisted note via direct link', async () => {
  const learningId = createdLearningIds[0];

  // Secondary user accesses directly
  const resOther = await fetch(`${baseUrl}/learnings/${learningId}`, {
    headers: { Authorization: `Bearer ${otherToken}` },
  });
  assert.strictEqual(resOther.status, 200);
  const dataOther = await resOther.json();
  assert.strictEqual(dataOther.learningId, learningId);
  assert.strictEqual(dataOther.isAuthor, false);

  // Unauthenticated guest accesses directly
  const resGuest = await fetch(`${baseUrl}/learnings/${learningId}`);
  assert.strictEqual(resGuest.status, 200);
  const dataGuest = await resGuest.json();
  assert.strictEqual(dataGuest.learningId, learningId);
  assert.strictEqual(dataGuest.isAuthor, false);
});

test('GET /learnings (explore feed) does NOT list unlisted notes', async () => {
  const learningId = createdLearningIds[0];
  const res = await fetch(`${baseUrl}/learnings`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();

  const found = data.learnings.some((item) => item.learningId === learningId);
  assert.strictEqual(found, false, 'Unlisted note must not appear in public explore feed');
});

test('PUT /learnings/:learningId allows author to publish as public', async () => {
  const learningId = createdLearningIds[0];

  const res = await fetch(`${baseUrl}/learnings/${learningId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authorToken}`,
    },
    body: JSON.stringify({
      visibility: 'public',
    }),
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.visibility, 'public');
});

test('GET /learnings (explore feed) lists public note and filters by search/tag', async () => {
  const learningId = createdLearningIds[0];

  // Basic explore fetch
  const res = await fetch(`${baseUrl}/learnings`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  const found = data.learnings.some((item) => item.learningId === learningId);
  assert.strictEqual(found, true, 'Public note should appear in public explore feed');

  // Tag filter
  const tagRes = await fetch(`${baseUrl}/learnings?tag=patterns`);
  assert.strictEqual(tagRes.status, 200);
  const tagData = await tagRes.json();
  const foundTag = tagData.learnings.some((item) => item.learningId === learningId);
  assert.strictEqual(foundTag, true, 'Note should match tag query');

  // Search filter
  const searchRes = await fetch(`${baseUrl}/learnings?search=Pointers`);
  assert.strictEqual(searchRes.status, 200);
  const searchData = await searchRes.json();
  const foundSearch = searchData.learnings.some((item) => item.learningId === learningId);
  assert.strictEqual(foundSearch, true, 'Note should match search query');
});

test('PUT /learnings/:learningId rejects non-author updates with 403 Forbidden', async () => {
  const learningId = createdLearningIds[0];

  const res = await fetch(`${baseUrl}/learnings/${learningId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${otherToken}`,
    },
    body: JSON.stringify({ title: 'Hacked Title' }),
  });

  assert.strictEqual(res.status, 403);
});

test('DELETE /learnings/:learningId rejects non-author deletion with 403 Forbidden', async () => {
  const learningId = createdLearningIds[0];

  const res = await fetch(`${baseUrl}/learnings/${learningId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${otherToken}` },
  });

  assert.strictEqual(res.status, 403);
});

test('DELETE /learnings/:learningId deletes note for author', async () => {
  const learningId = createdLearningIds[0];

  const res = await fetch(`${baseUrl}/learnings/${learningId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${authorToken}` },
  });

  assert.strictEqual(res.status, 200);

  // Subsequent fetch should return 404
  const checkRes = await fetch(`${baseUrl}/learnings/${learningId}`);
  assert.strictEqual(checkRes.status, 404);
});
