import { test } from 'node:test';
import assert from 'node:assert';
import { ProcessSandbox } from '../src/executor/ProcessSandbox.js';
import { getLanguageById } from '../src/languages/index.js';

const sandbox = new ProcessSandbox();

test('executor runs JavaScript successfully with stdout', async () => {
  const submission = {
    token: 'test-js',
    source_code: 'console.log("Calculated:", 21 * 2);',
    language: getLanguageById(63),
    stdin: '',
  };
  const result = await sandbox.execute(submission);
  assert.strictEqual(result.status.id, 3); // Accepted
  assert.strictEqual(result.stdout.trim(), 'Calculated: 42');
  assert.strictEqual(result.exit_code, 0);
  assert.ok(result.time >= 0);
});

test('executor passes custom stdin into Python', async () => {
  const submission = {
    token: 'test-py-stdin',
    source_code: 'import sys\nname = sys.stdin.read().strip()\nprint(f"Hello, {name}!")',
    language: getLanguageById(71),
    stdin: 'LeetCode',
  };
  const result = await sandbox.execute(submission);
  assert.strictEqual(result.status.id, 3);
  assert.strictEqual(result.stdout.trim(), 'Hello, LeetCode!');
});

test('executor captures runtime errors accurately', async () => {
  const submission = {
    token: 'test-py-err',
    source_code: 'raise ValueError("Something broke")',
    language: getLanguageById(71),
    stdin: '',
  };
  const result = await sandbox.execute(submission);
  assert.strictEqual(result.status.id, 11); // Runtime Error
  assert.match(result.stderr, /ValueError: Something broke/);
});

test('executor enforces timeout on infinite loop', async () => {
  const submission = {
    token: 'test-js-tle',
    source_code: 'while(true) {}',
    language: getLanguageById(63),
    stdin: '',
    cpu_time_limit: 1.0, // 1 second timeout for test speed
  };
  const result = await sandbox.execute(submission);
  assert.strictEqual(result.status.id, 5); // Time Limit Exceeded
});

test('executor compiles and runs C++ with <bits/stdc++.h>', async () => {
  const cppCode = `#include <bits/stdc++.h>
using namespace std;
int main() {
    vector<string> items = {"LeetCode", "IDE"};
    for (const auto& s : items) cout << s << " ";
    cout << endl;
    return 0;
}
`;
  const submission = {
    token: 'test-cpp-bits',
    source_code: cppCode,
    language: getLanguageById(54),
    stdin: '',
  };
  const result = await sandbox.execute(submission);
  assert.strictEqual(result.status.id, 3); // Accepted
  assert.strictEqual(result.stdout.trim(), 'LeetCode IDE');
  assert.strictEqual(result.exit_code, 0);
});

test('executor compiles and runs C++ multithreading (vector<thread>)', async () => {
  const cppThreadCode = `#include <bits/stdc++.h>
using namespace std;
int main() {
    vector<thread> threads;
    atomic<int> counter(0);
    for (int i = 0; i < 3; ++i) {
        threads.emplace_back([&counter]() { counter.fetch_add(1); });
    }
    for (auto& t : threads) {
        if (t.joinable()) t.join();
    }
    cout << "Final counter: " << counter.load() << endl;
    return 0;
}
`;
  const submission = {
    token: 'test-cpp-threads',
    source_code: cppThreadCode,
    language: getLanguageById(54),
    stdin: '',
  };
  const result = await sandbox.execute(submission);
  assert.strictEqual(result.status.id, 3); // Accepted
  assert.strictEqual(result.stdout.trim(), 'Final counter: 3');
  assert.strictEqual(result.exit_code, 0);
});
