import { test } from 'node:test';
import assert from 'node:assert';
import { auditCode, analyzeCode } from '../src/security/codeAnalyzer.js';

// ============================================================
// BENIGN COMPETITIVE PROGRAMMING TESTS
// ============================================================

test('auditCode marks benign competitive programming code as SAFE across all languages', () => {
  const cppCode = `
#include <bits/stdc++.h>
using namespace std;
int main() {
    int a, b;
    if (cin >> a >> b) {
        cout << (a + b) << endl;
    }
    return 0;
}
`;
  const cppAudit = auditCode(cppCode, 54);
  assert.strictEqual(cppAudit.safe_to_execute, true);
  assert.strictEqual(cppAudit.verdict, 'SAFE');
  assert.strictEqual(cppAudit.findings.length, 0);

  const pyCode = `
import sys
def main():
    lines = sys.stdin.read().split()
    if lines:
        print(sum(map(int, lines)))
if __name__ == '__main__':
    main()
`;
  const pyAudit = auditCode(pyCode, 71);
  assert.strictEqual(pyAudit.safe_to_execute, true);
  assert.strictEqual(pyAudit.verdict, 'SAFE');
  assert.strictEqual(pyAudit.findings.length, 0);

  const jsCode = `
const fs = require('fs');
class Scanner {
    constructor() { this.input = fs.readFileSync(0, 'utf8'); }
}
const sc = new Scanner();
console.log("Hello from Scanner");
`;
  const jsAudit = auditCode(jsCode, 63);
  assert.strictEqual(jsAudit.safe_to_execute, true);
  assert.strictEqual(jsAudit.verdict, 'SAFE');

  const tsCode = `
import * as fs from 'fs';
const raw = fs.readFileSync(0, 'utf8');
const nums: number[] = raw.trim().split(/\\s+/).map(Number);
console.log(nums.reduce((a, b) => a + b, 0));
`;
  const tsAudit = auditCode(tsCode, 74);
  assert.strictEqual(tsAudit.safe_to_execute, true);
  assert.strictEqual(tsAudit.verdict, 'SAFE');

  const javaCode = `
import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            System.out.println(sc.nextInt() * 2);
        }
    }
}
`;
  const javaAudit = auditCode(javaCode, 62);
  assert.strictEqual(javaAudit.safe_to_execute, true);
  assert.strictEqual(javaAudit.verdict, 'SAFE');

  const cCode = `
#include <stdio.h>
int main() {
    int x;
    if (scanf("%d", &x) == 1) {
        printf("%d\\n", x * x);
    }
    return 0;
}
`;
  const cAudit = auditCode(cCode, 50);
  assert.strictEqual(cAudit.safe_to_execute, true);
  assert.strictEqual(cAudit.verdict, 'SAFE');
});

// ============================================================
// 1. FILESYSTEM DESTRUCTION
// ============================================================
test('Category 1: detects filesystem destruction across languages', () => {
  const pyExploit = 'import shutil\nshutil.rmtree("/tmp")';
  const pyRes = auditCode(pyExploit, 'python');
  assert.strictEqual(pyRes.verdict, 'BLOCK');
  assert.ok(pyRes.findings.some((f) => f.category === 'Filesystem destruction'));

  const jsExploit = 'const fs = require("fs");\nfs.unlinkSync("/app/server.js");';
  const jsRes = auditCode(jsExploit, 'javascript');
  assert.strictEqual(jsRes.verdict, 'BLOCK');
  assert.ok(jsRes.findings.some((f) => f.category === 'Filesystem destruction'));

  const cExploit = '#include <unistd.h>\nint main() { unlink("/etc/issue"); }';
  const cRes = auditCode(cExploit, 'c');
  assert.strictEqual(cRes.verdict, 'BLOCK');
  assert.ok(cRes.findings.some((f) => f.category === 'Filesystem destruction'));
});

// ============================================================
// 2. ARBITRARY COMMAND EXECUTION
// ============================================================
test('Category 2: detects arbitrary command execution APIs', () => {
  const cExec = '#include <stdlib.h>\nint main() { system("whoami"); }';
  const cRes = auditCode(cExec, 54);
  assert.strictEqual(cRes.verdict, 'BLOCK');
  assert.ok(cRes.findings.some((f) => f.category === 'Arbitrary command execution'));

  const pyExec = 'import subprocess\nsubprocess.Popen(["ls", "-la"])';
  const pyRes = auditCode(pyExec, 71);
  assert.strictEqual(pyRes.verdict, 'BLOCK');
  assert.ok(pyRes.findings.some((f) => f.category === 'Arbitrary command execution'));

  const javaExec = 'public class Main { public static void main(String[] args) throws Exception { Runtime.getRuntime().exec("id"); } }';
  const javaRes = auditCode(javaExec, 62);
  assert.strictEqual(javaRes.verdict, 'BLOCK');
  assert.ok(javaRes.findings.some((f) => f.category === 'Arbitrary command execution'));

  const jsExec = 'const cp = require("child_process"); cp.execSync("uname -a");';
  const jsRes = auditCode(jsExec, 63);
  assert.strictEqual(jsRes.verdict, 'BLOCK');
  assert.ok(jsRes.findings.some((f) => f.category === 'Arbitrary command execution'));
});

// ============================================================
// 3. SHELL EXECUTION
// ============================================================
test('Category 3: detects shell interpreter invocations', () => {
  const code = 'const shell = "/bin/bash";';
  const audit = auditCode(code, 63);
  assert.strictEqual(audit.verdict, 'BLOCK');
  assert.ok(audit.findings.some((f) => f.category === 'Shell execution'));
});

// ============================================================
// 4. COMMAND INJECTION
// ============================================================
test('Category 4: detects command injection and dynamic chaining', () => {
  const injection = 'system("echo hello " + userInput + " && /bin/sh");';
  const audit = auditCode(injection, 54);
  assert.strictEqual(audit.verdict, 'BLOCK');
  assert.ok(audit.findings.some((f) => f.category === 'Command injection' || f.category === 'Arbitrary command execution'));
});

// ============================================================
// 5. FILESYSTEM ESCAPE
// ============================================================
test('Category 5: detects filesystem escape and symlink attacks', () => {
  const traversal = 'const fs = require("fs"); fs.readFileSync("../../../../etc/passwd");';
  const audit = auditCode(traversal, 63);
  assert.strictEqual(audit.verdict, 'BLOCK');
  assert.ok(audit.findings.some((f) => f.category === 'Filesystem escape'));

  const symlink = 'import os\nos.symlink("/etc", "/tmp/link")';
  const symAudit = auditCode(symlink, 71);
  assert.strictEqual(symAudit.verdict, 'BLOCK');
  assert.ok(symAudit.findings.some((f) => f.category === 'Filesystem escape'));
});

// ============================================================
// 6. SENSITIVE FILESYSTEM ACCESS
// ============================================================
test('Category 6: detects sensitive system file accesses', () => {
  const shadow = 'with open("/etc/shadow") as f: pass';
  assert.strictEqual(auditCode(shadow, 71).verdict, 'BLOCK');

  const docker = 'const sock = "/var/run/docker.sock";';
  assert.strictEqual(auditCode(docker, 63).verdict, 'BLOCK');

  const ssh = 'open(".ssh/id_rsa")';
  assert.strictEqual(auditCode(ssh, 71).verdict, 'BLOCK');
});

// ============================================================
// 7. ENVIRONMENT / SECRET ACCESS
// ============================================================
test('Category 7: detects environment variable and secret exfiltration', () => {
  const jsEnv = 'console.log(process.env.DATABASE_URL);';
  assert.ok(auditCode(jsEnv, 63).findings.some((f) => f.category === 'Environment / secret access'));

  const pyEnv = 'import os\nprint(os.environ["SECRET_KEY"])';
  assert.ok(auditCode(pyEnv, 71).findings.some((f) => f.category === 'Environment / secret access'));

  const cEnv = '#include <stdlib.h>\nint main() { char* p = getenv("PATH"); }';
  assert.ok(auditCode(cEnv, 54).findings.some((f) => f.category === 'Environment / secret access'));
});

// ============================================================
// 8. NETWORK ACCESS
// ============================================================
test('Category 8: detects network socket and client APIs', () => {
  const cSocket = '#include <sys/socket.h>\nint main() { socket(AF_INET, SOCK_STREAM, 0); }';
  assert.ok(auditCode(cSocket, 54).findings.some((f) => f.category === 'Network access'));

  const pyNet = 'import requests\nr = requests.get("http://example.com")';
  assert.ok(auditCode(pyNet, 71).findings.some((f) => f.category === 'Network access'));

  const javaNet = 'import java.net.Socket;\npublic class Main { Socket s; }';
  assert.ok(auditCode(javaNet, 62).findings.some((f) => f.category === 'Network access'));

  const jsNet = 'const http = require("http");';
  assert.ok(auditCode(jsNet, 63).findings.some((f) => f.category === 'Network access'));
});

// ============================================================
// 9. REVERSE-SHELL BEHAVIOR
// ============================================================
test('Category 9: detects reverse shell combinations', () => {
  const rev = 'import pty, os, socket\npty.spawn("/bin/bash")';
  const audit = auditCode(rev, 71);
  assert.strictEqual(audit.verdict, 'BLOCK');
  assert.ok(audit.findings.some((f) => f.category === 'Reverse-shell behavior' || f.category === 'Shell execution'));
});

// ============================================================
// 10. PRIVILEGE ESCALATION
// ============================================================
test('Category 10: detects privilege escalation attempts', () => {
  const priv = 'system("sudo id");';
  const audit = auditCode(priv, 54);
  assert.strictEqual(audit.verdict, 'BLOCK');
  assert.ok(audit.findings.some((f) => f.category === 'Privilege escalation'));
});

// ============================================================
// 11. CONTAINER ESCAPE
// ============================================================
test('Category 11: detects container escape and namespace manipulation', () => {
  const escape = '#define _GNU_SOURCE\n#include <sched.h>\nint main() { unshare(CLONE_NEWNS); }';
  const audit = auditCode(escape, 54);
  assert.strictEqual(audit.verdict, 'BLOCK');
  assert.ok(audit.findings.some((f) => f.category === 'Container escape'));
});

// ============================================================
// 12. PROCESS MANIPULATION
// ============================================================
test('Category 12: detects ptrace and arbitrary process signaling', () => {
  const trace = '#include <sys/ptrace.h>\nint main() { ptrace(0, 0, 0, 0); }';
  const audit = auditCode(trace, 54);
  assert.strictEqual(audit.verdict, 'BLOCK');
  assert.ok(audit.findings.some((f) => f.category === 'Process manipulation'));
});

// ============================================================
// 13. RESOURCE EXHAUSTION
// ============================================================
test('Category 13: detects fork bombs and resource exhaustion', () => {
  const bomb = 'int main() { while(1) fork(); }';
  const audit = auditCode(bomb, 54);
  assert.strictEqual(audit.verdict, 'BLOCK');
  assert.ok(audit.findings.some((f) => f.category === 'Resource exhaustion'));

  const pyBomb = 'import os\nwhile True: os.fork()';
  assert.strictEqual(auditCode(pyBomb, 71).verdict, 'BLOCK');
});

// ============================================================
// 14. DYNAMIC CODE EXECUTION
// ============================================================
test('Category 14: detects dynamic code execution (eval, Function)', () => {
  const jsDynamic = 'eval("console.log(1)");';
  assert.ok(auditCode(jsDynamic, 63).findings.some((f) => f.category === 'Dynamic code execution'));

  const pyDynamic = 'exec("import os")';
  assert.ok(auditCode(pyDynamic, 71).findings.some((f) => f.category === 'Dynamic code execution'));

  const javaReflect = 'Class.forName("java.lang.Runtime");';
  assert.ok(auditCode(javaReflect, 62).findings.some((f) => f.category === 'Dynamic code execution'));
});

// ============================================================
// 15. OBFUSCATION
// ============================================================
test('Category 15: detects de-obfuscation and encoded payload execution', () => {
  // String concatenation of sensitive path
  const concatPath = 'const p = "/et" + "c/pass" + "wd";';
  const concatAudit = auditCode(concatPath, 63);
  assert.strictEqual(concatAudit.verdict, 'BLOCK');
  assert.ok(concatAudit.findings.some((f) => f.category === 'Sensitive filesystem access'));

  // Hex encoded path
  const hexPath = 'open("\\x2f\\x65\\x74\\x63\\x2f\\x70\\x61\\x73\\x73\\x77\\x64")';
  const hexAudit = auditCode(hexPath, 71);
  assert.strictEqual(hexAudit.verdict, 'BLOCK');

  // Base64 encoded payload: "rm -rf /"
  const b64 = 'const payload = "cm0gLXJmIC8=";';
  const b64Audit = auditCode(b64, 63);
  assert.strictEqual(b64Audit.verdict, 'BLOCK');
  assert.ok(b64Audit.findings.some((f) => f.category === 'Obfuscation'));
});

// ============================================================
// 16. NATIVE CODE LOADING
// ============================================================
test('Category 16: detects native code loading APIs', () => {
  const pyCtypes = 'import ctypes\nctypes.CDLL(None)';
  assert.ok(auditCode(pyCtypes, 71).findings.some((f) => f.category === 'Native code loading'));

  const cDl = '#include <dlfcn.h>\nint main() { dlopen("lib.so", 1); }';
  assert.ok(auditCode(cDl, 54).findings.some((f) => f.category === 'Native code loading'));
});

// ============================================================
// 17. DEVICE ACCESS
// ============================================================
test('Category 17: detects raw block and memory device access', () => {
  const rawDisk = 'open("/dev/sda", "rb")';
  const audit = auditCode(rawDisk, 71);
  assert.strictEqual(audit.verdict, 'BLOCK');
  assert.ok(audit.findings.some((f) => f.category === 'Device access' || f.category === 'Sensitive filesystem access'));
});

// ============================================================
// 18. KERNEL / SYSTEM INTERFACES
// ============================================================
test('Category 18: detects direct syscall and ioctl invocation', () => {
  const rawSyscall = '#include <unistd.h>\n#include <sys/syscall.h>\nint main() { syscall(SYS_execve, "/bin/sh", 0, 0); }';
  const audit = auditCode(rawSyscall, 54);
  assert.strictEqual(audit.verdict, 'BLOCK');
  assert.ok(audit.findings.some((f) => f.category === 'Kernel / system interfaces'));
});

// ============================================================
// 19. OUTPUT ABUSE
// ============================================================
test('Category 19: detects infinite output storm loops', () => {
  const flood = 'int main() { while(1) printf("SPAM SPAM SPAM\\n"); }';
  const audit = auditCode(flood, 50);
  assert.ok(audit.findings.some((f) => f.category === 'Output abuse'));
});

// ============================================================
// 20. SANDBOX BOUNDARY VIOLATIONS
// ============================================================
test('Category 20: detects sandbox boundary violations', () => {
  const hostBin = 'const cat = "/usr/bin/cat";';
  const audit = auditCode(hostBin, 63);
  assert.strictEqual(audit.verdict, 'BLOCK');
  assert.ok(audit.findings.some((f) => f.category === 'Sandbox boundary violations'));
});

// ============================================================
// COMPATIBILITY API (analyzeCode)
// ============================================================
test('analyzeCode compatibility wrapper functions correctly', () => {
  const safe = analyzeCode('console.log("Safe");', 63);
  assert.strictEqual(safe.rejected, false);
  assert.strictEqual(safe.reason, null);

  const blocked = analyzeCode('import os\nos.system("id")', 71);
  assert.strictEqual(blocked.rejected, true);
  assert.ok(blocked.reason.includes('Arbitrary command execution'));
});
