import { test } from 'node:test';
import assert from 'node:assert';
import { getLanguageById, getAllLanguages, getStatusById, STATUSES } from '../src/languages/index.js';

test('languages registry provides all 6 core languages', () => {
  const expectedIds = [54, 62, 71, 63, 74, 50];
  for (const id of expectedIds) {
    const lang = getLanguageById(id);
    assert.ok(lang, `Language id ${id} must exist`);
    assert.ok(lang.name);
    assert.ok(lang.source_file);
    assert.ok(lang.run_cmd);
  }
  assert.strictEqual(getAllLanguages().length, 6);
});

test('status registry maps Judge0 status IDs correctly', () => {
  assert.strictEqual(getStatusById(3).description, 'Accepted');
  assert.strictEqual(getStatusById(5).description, 'Time Limit Exceeded');
  assert.strictEqual(getStatusById(6).description, 'Compilation Error');
  assert.strictEqual(getStatusById(11).description, 'Runtime Error (NZEC)');
});
