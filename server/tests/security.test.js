import { test } from 'node:test';
import assert from 'node:assert';
import { analyzeCode } from '../src/security/codeAnalyzer.js';

test('codeAnalyzer permits benign hello world programs', () => {
  const cppCode = '#include <iostream>\nint main() { std::cout << "Hello"; return 0; }';
  assert.strictEqual(analyzeCode(cppCode, 54).rejected, false);

  const pyCode = 'print("Hello world")';
  assert.strictEqual(analyzeCode(pyCode, 71).rejected, false);

  const jsCode = 'console.log("Hello world");';
  assert.strictEqual(analyzeCode(jsCode, 63).rejected, false);
});

test('codeAnalyzer detects C++ fork bomb', () => {
  const bomb = '#include <unistd.h>\nint main() { while(1) fork(); }';
  const result = analyzeCode(bomb, 54);
  assert.strictEqual(result.rejected, true);
  assert.match(result.reason, /fork bomb/i);
});

test('codeAnalyzer detects sensitive path access', () => {
  const pyExploit = 'with open("/etc/passwd") as f: print(f.read())';
  const result = analyzeCode(pyExploit, 71);
  assert.strictEqual(result.rejected, true);
  assert.match(result.reason, /sensitive path/i);
});

test('codeAnalyzer detects socket syscall in C/C++', () => {
  const netCode = '#include <sys/socket.h>\nint main() { int s = socket(AF_INET, SOCK_STREAM, 0); }';
  const result = analyzeCode(netCode, 54);
  assert.strictEqual(result.rejected, true);
  assert.match(result.reason, /socket/i);
});
