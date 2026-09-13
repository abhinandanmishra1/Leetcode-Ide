import { test, before, after } from 'node:test';
import assert from 'node:assert';
import { startServer, stopServer } from '../src/api/server.js';

let baseUrl;
let authorToken;
let otherToken;
let createdSnippetId;

before(async () => {
  const app = await startServer(0);
  const port = app.address().port;
  baseUrl = `http://localhost:${port}`;

  // Log in author user
  const authorRes = await fetch(`${baseUrl}/auth/dev-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'author@codepad.local', name: 'Author Dev' }),
  });
  const authorData = await authorRes.json();
  authorToken = authorData.token;

  // Log in secondary user
  const otherRes = await fetch(`${baseUrl}/auth/dev-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'other@codepad.local', name: 'Other Dev' }),
  });
  const otherData = await otherRes.json();
  otherToken = otherData.token;
});

after(async () => {
  await stopServer();
});

test('POST /snippets creates a new snippet with unique snippetId', async () => {
  const res = await fetch(`${baseUrl}/snippets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authorToken}`,
    },
    body: JSON.stringify({
      title: 'Fibonacci DP',
      description: 'Memoized Fibonacci sequence in C++',
      languageId: 54,
      languageName: 'C++ (GCC 9.2.0)',
      code: 'int fib(int n) { return n <= 1 ? n : fib(n-1) + fib(n-2); }',
      testCases: [{ id: '1', name: 'Case 1', input: '5', expected: '5' }],
      isPublic: true,
    }),
  });

  assert.strictEqual(res.status, 201);
  const data = await res.json();
  assert.ok(data.snippetId);
  assert.strictEqual(data.title, 'Fibonacci DP');
  assert.strictEqual(data.author.name, 'Author Dev');
  assert.strictEqual(data.viewsCount, 0);
  assert.strictEqual(data.forksCount, 0);

  createdSnippetId = data.snippetId;
});

test('GET /snippets/:snippetId retrieves snippet and increments viewsCount', async () => {
  const res = await fetch(`${baseUrl}/snippets/${createdSnippetId}`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.snippetId, createdSnippetId);
  assert.strictEqual(data.viewsCount, 1);
});

test('PUT /snippets/:snippetId updates snippet when user is author', async () => {
  const res = await fetch(`${baseUrl}/snippets/${createdSnippetId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authorToken}`,
    },
    body: JSON.stringify({
      title: 'Fibonacci DP Optimized',
      description: 'Iterative O(N) solution',
    }),
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.title, 'Fibonacci DP Optimized');
  assert.strictEqual(data.description, 'Iterative O(N) solution');
});

test('PUT /snippets/:snippetId returns 403 Forbidden for non-author', async () => {
  const res = await fetch(`${baseUrl}/snippets/${createdSnippetId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${otherToken}`,
    },
    body: JSON.stringify({
      title: 'Hacked Title',
    }),
  });

  assert.strictEqual(res.status, 403);
});

test('POST /snippets/:snippetId/fork creates a clone and tracks parent snippet', async () => {
  const res = await fetch(`${baseUrl}/snippets/${createdSnippetId}/fork`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${otherToken}`,
    },
  });

  assert.strictEqual(res.status, 201);
  const data = await res.json();
  assert.ok(data.snippetId);
  assert.notStrictEqual(data.snippetId, createdSnippetId);
  assert.strictEqual(data.forkedFrom, createdSnippetId);
  assert.strictEqual(data.author.name, 'Other Dev');

  // Verify parent's forksCount incremented
  const parentRes = await fetch(`${baseUrl}/snippets/${createdSnippetId}`);
  const parentData = await parentRes.json();
  assert.strictEqual(parentData.forksCount, 1);
});

test('GET /snippets returns paginated public snippets list', async () => {
  const res = await fetch(`${baseUrl}/snippets?page=1&limit=10`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.snippets));
  assert.ok(data.snippets.length >= 2);
  assert.ok(data.pagination);
  assert.strictEqual(data.pagination.page, 1);
  assert.ok(data.pagination.total >= 2);
});
