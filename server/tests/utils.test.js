import { test } from 'node:test';
import assert from 'node:assert';
import { encodeIfNeeded, decodeIfNeeded } from '../src/utils/base64.js';
import config from '../src/utils/config.js';

test('base64 utils encode and decode correctly', () => {
  const original = 'console.log("Hello");';
  const encoded = encodeIfNeeded(original, true);
  assert.strictEqual(encoded, Buffer.from(original).toString('base64'));
  const decoded = decodeIfNeeded(encoded, true);
  assert.strictEqual(decoded, original);
  assert.strictEqual(encodeIfNeeded(original, false), original);
  assert.strictEqual(decodeIfNeeded(original, false), original);
});

test('config loads default port and execution limits', () => {
  assert.strictEqual(typeof config.port, 'number');
  assert.strictEqual(typeof config.executionTimeoutMs, 'number');
  assert.strictEqual(typeof config.maxMemoryMb, 'number');
});
