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

test('executor compiles and runs Java with public class Main', async () => {
  const javaCode = `
import java.util.*;
public class Main {
    public static void main(String[] args) {
        System.out.println("Java Main Works!");
    }
}
`;
  const submission = {
    token: 'test-java-main-exec',
    source_code: javaCode,
    language: getLanguageById(62),
    stdin: '',
  };
  const result = await sandbox.execute(submission);
  assert.strictEqual(result.status.id, 3); // Accepted
  assert.strictEqual(result.stdout.trim(), 'Java Main Works!');
  assert.strictEqual(result.exit_code, 0);
});

test('executor compiles and runs Java with public class Solution', async () => {
  const javaCode = `
public class Solution {
    public static void main(String[] args) {
        System.out.println("Java Solution Works!");
    }
}
`;
  const submission = {
    token: 'test-java-solution-exec',
    source_code: javaCode,
    language: getLanguageById(62),
    stdin: '',
  };
  const result = await sandbox.execute(submission);
  assert.strictEqual(result.status.id, 3); // Accepted
  assert.strictEqual(result.stdout.trim(), 'Java Solution Works!');
  assert.strictEqual(result.exit_code, 0);
});

test('executor runs C++ without explicit headers (auto-included bits/stdc++.h)', async () => {
  // No #include, no using namespace std
  const cppNoHeaders = `
int main() {
    vector<int> nums = {10, 20, 30};
    for (int x : nums) cout << x << " ";
    cout << endl;
    return 0;
}
`;
  const submission = {
    token: 'test-cpp-auto-headers',
    source_code: cppNoHeaders,
    language: getLanguageById(54),
    stdin: '',
  };
  const result = await sandbox.execute(submission);
  assert.strictEqual(result.status.id, 3); // Accepted
  assert.strictEqual(result.stdout.trim(), '10 20 30');
});

test('executor runs Python without explicit imports (auto-imported Counter, deque)', async () => {
  // No import collections, no import sys
  const pyNoImports = `
c = Counter(["apple", "banana", "apple"])
d = deque([1, 2, 3])
d.append(4)
print(c["apple"], list(d))
`;
  const submission = {
    token: 'test-py-auto-imports',
    source_code: pyNoImports,
    language: getLanguageById(71),
    stdin: '',
  };
  const result = await sandbox.execute(submission);
  assert.strictEqual(result.status.id, 3); // Accepted
  assert.strictEqual(result.stdout.trim(), '2 [1, 2, 3, 4]');
});

test('executor runs Java without explicit imports (auto-imported java.util.*)', async () => {
  // No import java.util.*
  const javaNoImports = `
public class Solution {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>();
        list.add("Auto");
        list.add("Imports");
        System.out.println(String.join(" ", list));
    }
}
`;
  const submission = {
    token: 'test-java-auto-imports',
    source_code: javaNoImports,
    language: getLanguageById(62),
    stdin: '',
  };
  const result = await sandbox.execute(submission);
  assert.strictEqual(result.status.id, 3); // Accepted
  assert.strictEqual(result.stdout.trim(), 'Auto Imports');
});

test('executor compiles and runs TypeScript with I/O utilities', async () => {
  const tsCode = `
function main(): void {
    const n: number = getNumInput();
    const s: string = getStringInput();
    const arr: number[] = getArrayInput(n);
    console.log(\`TS: \${n}, \${s}, \${arr.join(',')}\`);
}
main();
`;
  const submission = {
    token: 'test-ts-io',
    source_code: tsCode,
    language: getLanguageById(74),
    stdin: '3 alpha 10 20 30',
  };
  const result = await sandbox.execute(submission);
  assert.strictEqual(result.status.id, 3); // Accepted
  assert.strictEqual(result.stdout.trim(), 'TS: 3, alpha, 10,20,30');
});

test('executor runs JavaScript with I/O utilities', async () => {
  const jsCode = `
function main() {
    const n = getNumInput();
    const s = getStringInput();
    const arr = getArrayInput(n);
    console.log(\`JS: \${n}, \${s}, \${arr.join(',')}\`);
}
main();
`;
  const submission = {
    token: 'test-js-io',
    source_code: jsCode,
    language: getLanguageById(63),
    stdin: '3 beta 100 200 300',
  };
  const result = await sandbox.execute(submission);
  assert.strictEqual(result.status.id, 3); // Accepted
  assert.strictEqual(result.stdout.trim(), 'JS: 3, beta, 100,200,300');
});

