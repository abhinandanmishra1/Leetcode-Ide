import { test } from 'node:test';
import assert from 'node:assert';
import { initializeQueue, addSubmission, getSubmission, closeQueue } from '../src/queue/producer.js';
import { startWorker, stopWorker } from '../src/queue/worker.js';
import { getLanguageById } from '../src/languages/index.js';

test('queue processes submission job and saves result', async () => {
  await initializeQueue();
  await startWorker();

  const token = 'queue-test-' + Date.now();
  const submission = {
    token,
    language_id: 63,
    language: getLanguageById(63),
    source_code: 'console.log("Queue passed!");',
    stdin: '',
  };

  await addSubmission(submission);

  // Poll for result
  let result = null;
  for (let i = 0; i < 20; i++) {
    result = await getSubmission(token);
    if (result && result.status && result.status.id >= 3) break;
    await new Promise((r) => setTimeout(r, 100));
  }

  assert.ok(result);
  assert.strictEqual(result.status.id, 3);
  assert.strictEqual(result.stdout.trim(), 'Queue passed!');

  await stopWorker();
  await closeQueue();
});
