# Sandboxed Code Execution Service & LeetCode UI Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready, sandboxed multi-language code execution service (`server/`) deployable on Railway within a $10/month budget constraint, replace Judge0 RapidAPI on the client (`client/`), upgrade the frontend to a LeetCode dark aesthetic with tabbed console metrics, and add automatic `localStorage` code persistence.

**Architecture:** A unified containerized Express service (`server/`) with BullMQ and an automatic in-memory queue fallback, unprivileged process sandbox (`ProcessSandbox.js`) enforcing time and memory limits, pre-execution static code analyzer (`codeAnalyzer.js`), IP rate limiter, and clean Judge0-compatible REST endpoints. The React client (`client/`) communicates directly with this server, persists code per language in `localStorage`, and provides live execution telemetry.

**Tech Stack:** Node.js 20 LTS, Express 4, BullMQ 5, ioredis 5, Pino, express-rate-limit, React 18, Monaco Editor, Tailwind CSS, Docker (Ubuntu 22.04 with GCC 11, OpenJDK 17, Python 3, TypeScript).

## Global Constraints

- Backend must execute within 512MB RAM on Railway to ensure monthly cost stays ~$2.50–$3.50, well within Railway's $5 included credit on the Hobby plan.
- Core 6 languages supported: C++ (54), Java (62), Python 3 (71), JavaScript (63), TypeScript (74), C (50).
- Redis Cloud (free 30MB) or internal in-memory queue fallback when `REDIS_URL` is omitted.
- Maximum 30 requests per minute per IP rate limit.
- All code files auto-saved to `localStorage` per language to prevent code loss.
- Provide `.env.example`, `.env.local` for development and documentation for production.

---

### Task 1: Server Scaffolding & Environment Configuration

**Files:**
- Create: `server/package.json`
- Create: `server/.env.example`
- Create: `server/.env.local`
- Create: `server/.gitignore`

**Interfaces:**
- Consumes: None
- Produces: Base configuration and npm scripts (`npm start`, `npm run dev`, `npm test`)

- [ ] **Step 1: Create `server/package.json`**

```json
{
  "name": "leetcode-ide-server",
  "version": "1.0.0",
  "description": "Sandboxed multi-language code execution engine",
  "type": "module",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js",
    "test": "node --test tests/**/*.test.js"
  },
  "dependencies": {
    "bullmq": "^5.41.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-rate-limit": "^7.2.0",
    "ioredis": "^5.4.1",
    "pino": "^8.20.0",
    "pino-pretty": "^11.0.0",
    "uuid": "^9.0.1"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

- [ ] **Step 2: Create `server/.env.example` and `server/.env.local`**

`.env.example`:
```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:3000
# Optional: leave blank for in-memory queue fallback, or provide Redis Cloud URL:
# REDIS_URL=redis://default:password@host:port
REDIS_URL=
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=30
EXECUTION_TIMEOUT_MS=5000
MAX_MEMORY_MB=256
```

`.env.local`:
```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:3000
REDIS_URL=
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=30
EXECUTION_TIMEOUT_MS=5000
MAX_MEMORY_MB=256
```

- [ ] **Step 3: Create `server/.gitignore`**

```gitignore
node_modules/
.env
.env.local
/tmp/codebox/
*.log
```

- [ ] **Step 4: Install dependencies in `server/`**

Run: `cd server && npm install`
Expected: `added ... packages`

- [ ] **Step 5: Commit**

```bash
git add server/package.json server/package-lock.json server/.env.example server/.env.local server/.gitignore
git commit -m "feat(server): initialize server package, dependencies, and environment files"
```

---

### Task 2: Core Server Utilities & Configuration

**Files:**
- Create: `server/src/utils/config.js`
- Create: `server/src/utils/logger.js`
- Create: `server/src/utils/base64.js`
- Test: `server/tests/utils.test.js`

**Interfaces:**
- Consumes: Environment variables
- Produces: `config` object, `logger` (Pino), `decodeIfNeeded(str, base64Encoded)`, `encodeIfNeeded(str, base64Encoded)`

- [ ] **Step 1: Write test for base64 and config utils**

Create `server/tests/utils.test.js`:
```javascript
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
```

- [ ] **Step 2: Run test to verify failure**

Run: `node --test server/tests/utils.test.js`
Expected: FAIL (modules not found)

- [ ] **Step 3: Implement `src/utils/config.js`, `logger.js`, `base64.js`**

`server/src/utils/config.js`:
```javascript
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local if present, else .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export default {
  port: parseInt(process.env.PORT, 10) || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || '*',
  redisUrl: process.env.REDIS_URL || '',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 30,
  },
  executionTimeoutMs: parseInt(process.env.EXECUTION_TIMEOUT_MS, 10) || 5000,
  maxMemoryMb: parseInt(process.env.MAX_MEMORY_MB, 10) || 256,
};
```

`server/src/utils/logger.js`:
```javascript
import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' },
      }
    : undefined,
});

export default logger;
```

`server/src/utils/base64.js`:
```javascript
export function decodeIfNeeded(value, isBase64) {
  if (!value) return '';
  if (!isBase64) return value;
  try {
    return Buffer.from(value, 'base64').toString('utf-8');
  } catch (err) {
    return value;
  }
}

export function encodeIfNeeded(value, isBase64) {
  if (value === null || value === undefined) return null;
  if (!isBase64) return value;
  return Buffer.from(String(value), 'utf-8').toString('base64');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test server/tests/utils.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/src/utils/ server/tests/utils.test.js
git commit -m "feat(server): add config, logger, and base64 utilities with tests"
```

---

### Task 3: Static Security Code Analyzer

**Files:**
- Create: `server/src/security/codeAnalyzer.js`
- Create: `server/tests/security.test.js`

**Interfaces:**
- Consumes: `source_code`, `language_id`
- Produces: `analyzeCode(sourceCode, languageId)` returning `{ rejected: boolean, reason: string | null }`

- [ ] **Step 1: Write failing security tests**

Create `server/tests/security.test.js`:
```javascript
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
```

- [ ] **Step 2: Run test to verify failure**

Run: `node --test server/tests/security.test.js`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `server/src/security/codeAnalyzer.js`**

```javascript
const SENSITIVE_PATHS = [
  /\/etc\/passwd/,
  /\/etc\/shadow/,
  /\/etc\/group/,
  /\/proc\/self\//,
  /\/proc\/1\//,
  /\/var\/run\/docker\.sock/,
  /\/dev\/sd[a-z]/,
  /\/dev\/nvme/,
];

const C_CPP_PATTERNS = [
  { pattern: /\bptrace\s*\(/, reason: 'ptrace syscall prohibited' },
  { pattern: /sys\/ptrace\.h/, reason: 'ptrace header prohibited' },
  { pattern: /\bsocket\s*\(/, reason: 'socket syscall prohibited' },
  { pattern: /\bconnect\s*\(\s*\w+\s*,/, reason: 'network connect prohibited' },
  { pattern: /\bbind\s*\(\s*\w+\s*,/, reason: 'network bind prohibited' },
  { pattern: /while\s*\(\s*1\s*\)\s*\{?\s*fork\s*\(/, reason: 'fork bomb detected' },
  { pattern: /while\s*\(fork\s*\(\)/, reason: 'fork bomb detected' },
  { pattern: /:\s*fork\s*\(\)\s*\|/, reason: 'fork bomb detected' },
];

const JAVA_PATTERNS = [
  { pattern: /Runtime\s*\.\s*getRuntime\s*\(\s*\)\s*\.\s*exec/, reason: 'Runtime.exec() prohibited' },
  { pattern: /ProcessBuilder/, reason: 'ProcessBuilder prohibited' },
  { pattern: /java\.net\.Socket/, reason: 'network socket prohibited' },
  { pattern: /java\.net\.ServerSocket/, reason: 'network server socket prohibited' },
];

const PYTHON_PATTERNS = [
  { pattern: /os\.fork\s*\(/, reason: 'os.fork() prohibited' },
  { pattern: /socket\s*\.\s*socket/, reason: 'network socket prohibited' },
  { pattern: /subprocess\s*\.\s*Popen/, reason: 'subprocess.Popen prohibited' },
];

export function analyzeCode(sourceCode, languageId) {
  if (!sourceCode) return { rejected: false, reason: null };

  for (const pathPattern of SENSITIVE_PATHS) {
    if (pathPattern.test(sourceCode)) {
      return { rejected: true, reason: 'Access to sensitive path prohibited' };
    }
  }

  // Language specific checks
  if (languageId === 50 || languageId === 54) {
    for (const { pattern, reason } of C_CPP_PATTERNS) {
      if (pattern.test(sourceCode)) return { rejected: true, reason };
    }
  } else if (languageId === 62) {
    for (const { pattern, reason } of JAVA_PATTERNS) {
      if (pattern.test(sourceCode)) return { rejected: true, reason };
    }
  } else if (languageId === 71) {
    for (const { pattern, reason } of PYTHON_PATTERNS) {
      if (pattern.test(sourceCode)) return { rejected: true, reason };
    }
  }

  return { rejected: false, reason: null };
}

export default analyzeCode;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test server/tests/security.test.js`
Expected: PASS (4 tests passed)

- [ ] **Step 5: Commit**

```bash
git add server/src/security/ server/tests/security.test.js
git commit -m "feat(server): implement static security analyzer and pattern detection"
```

---

### Task 4: Language Configurations & Judge0 Status Registry

**Files:**
- Create: `server/src/languages/index.js`
- Create: `server/src/languages/cpp.js`
- Create: `server/src/languages/c.js`
- Create: `server/src/languages/java.js`
- Create: `server/src/languages/python.js`
- Create: `server/src/languages/javascript.js`
- Create: `server/src/languages/typescript.js`
- Test: `server/tests/languages.test.js`

**Interfaces:**
- Consumes: Language IDs
- Produces: `getLanguageById(id)`, `getAllLanguages()`, `getStatusById(id)`, `STATUSES`

- [ ] **Step 1: Write tests for language configurations**

Create `server/tests/languages.test.js`:
```javascript
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
```

- [ ] **Step 2: Run test to verify failure**

Run: `node --test server/tests/languages.test.js`
Expected: FAIL

- [ ] **Step 3: Implement language definitions and registry**

`server/src/languages/cpp.js`:
```javascript
export default {
  id: 54,
  name: 'C++ (GCC 11+)',
  label: 'C++',
  value: 'cpp',
  source_file: 'Solution.cpp',
  compile_cmd: 'g++ -O2 -std=c++17 Solution.cpp -o Solution',
  run_cmd: './Solution',
  default_cpu_limit: 2.0,
  default_memory_limit: 262144, // 256MB in KB
};
```

`server/src/languages/c.js`:
```javascript
export default {
  id: 50,
  name: 'C (GCC 11+)',
  label: 'C',
  value: 'c',
  source_file: 'Solution.c',
  compile_cmd: 'gcc -O2 Solution.c -o Solution',
  run_cmd: './Solution',
  default_cpu_limit: 2.0,
  default_memory_limit: 262144,
};
```

`server/src/languages/java.js`:
```javascript
export default {
  id: 62,
  name: 'Java (OpenJDK 17)',
  label: 'Java',
  value: 'java',
  source_file: 'Solution.java',
  compile_cmd: 'javac Solution.java',
  run_cmd: 'java -Xmx256m Solution',
  default_cpu_limit: 3.0,
  default_memory_limit: 262144,
};
```

`server/src/languages/python.js`:
```javascript
export default {
  id: 71,
  name: 'Python 3',
  label: 'Python 3',
  value: 'python',
  source_file: 'Solution.py',
  compile_cmd: null,
  run_cmd: 'python3 Solution.py',
  default_cpu_limit: 3.0,
  default_memory_limit: 262144,
};
```

`server/src/languages/javascript.js`:
```javascript
export default {
  id: 63,
  name: 'JavaScript (Node.js 20)',
  label: 'JavaScript',
  value: 'javascript',
  source_file: 'Solution.js',
  compile_cmd: null,
  run_cmd: 'node Solution.js',
  default_cpu_limit: 2.0,
  default_memory_limit: 262144,
};
```

`server/src/languages/typescript.js`:
```javascript
export default {
  id: 74,
  name: 'TypeScript (Node.js 20)',
  label: 'TypeScript',
  value: 'typescript',
  source_file: 'Solution.ts',
  compile_cmd: 'tsc --target es2022 Solution.ts',
  run_cmd: 'node Solution.js',
  default_cpu_limit: 3.0,
  default_memory_limit: 262144,
};
```

`server/src/languages/index.js`:
```javascript
import cpp from './cpp.js';
import c from './c.js';
import java from './java.js';
import python from './python.js';
import javascript from './javascript.js';
import typescript from './typescript.js';

const languagesList = [cpp, java, python, javascript, typescript, c];
const languagesById = new Map(languagesList.map((lang) => [lang.id, lang]));

// RapidAPI ID aliases for compatibility
const ALIASES = {
  93: javascript,
  102: javascript,
  94: typescript,
  92: python,
};
Object.entries(ALIASES).forEach(([aliasId, lang]) => {
  languagesById.set(Number(aliasId), lang);
});

export const STATUSES = {
  1: { id: 1, description: 'In Queue' },
  2: { id: 2, description: 'Processing' },
  3: { id: 3, description: 'Accepted' },
  4: { id: 4, description: 'Wrong Answer' },
  5: { id: 5, description: 'Time Limit Exceeded' },
  6: { id: 6, description: 'Compilation Error' },
  7: { id: 7, description: 'Runtime Error (SIGSEGV)' },
  11: { id: 11, description: 'Runtime Error (NZEC)' },
  13: { id: 13, description: 'Internal Error' },
};

export function getLanguageById(id) {
  return languagesById.get(Number(id)) || null;
}

export function getAllLanguages() {
  return languagesList;
}

export function getStatusById(id) {
  return STATUSES[id] || { id, description: 'Unknown Status' };
}

export default {
  getLanguageById,
  getAllLanguages,
  getStatusById,
  STATUSES,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test server/tests/languages.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/src/languages/ server/tests/languages.test.js
git commit -m "feat(server): define 6 core language runtime configurations and status mapping"
```

---

### Task 5: Sandboxed Process Execution Engine

**Files:**
- Create: `server/src/executor/ProcessSandbox.js`
- Create: `server/src/executor/ResultParser.js`
- Test: `server/tests/executor.test.js`

**Interfaces:**
- Consumes: Submission `{ source_code, language, stdin, cpu_time_limit }`
- Produces: `execute(submission)` returning `{ status, stdout, stderr, compile_output, time, memory, exit_code }`

- [ ] **Step 1: Write execution tests for Python & JavaScript**

Create `server/tests/executor.test.js`:
```javascript
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
```

- [ ] **Step 2: Run test to verify failure**

Run: `node --test server/tests/executor.test.js`
Expected: FAIL

- [ ] **Step 3: Implement `ResultParser.js` and `ProcessSandbox.js`**

`server/src/executor/ResultParser.js`:
```javascript
import { getStatusById } from '../languages/index.js';

export class ResultParser {
  parseExecutionResult({ exitCode, signal, timedOut, stdout, stderr }) {
    if (timedOut) {
      return {
        status: getStatusById(5), // Time Limit Exceeded
        stdout: stdout || null,
        stderr: 'Time Limit Exceeded\n',
        exit_code: null,
      };
    }

    if (signal === 'SIGSEGV') {
      return {
        status: getStatusById(7),
        stdout: stdout || null,
        stderr: stderr || 'Segmentation fault (core dumped)\n',
        exit_code: null,
      };
    }

    if (exitCode !== 0) {
      return {
        status: getStatusById(11), // Runtime Error
        stdout: stdout || null,
        stderr: stderr || `Process exited with code ${exitCode}`,
        exit_code: exitCode,
      };
    }

    return {
      status: getStatusById(3), // Accepted
      stdout: stdout || '',
      stderr: stderr || null,
      exit_code: 0,
    };
  }
}

export default ResultParser;
```

`server/src/executor/ProcessSandbox.js`:
```javascript
import { exec, spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { promisify } from 'util';
import config from '../utils/config.js';
import logger from '../utils/logger.js';
import { getStatusById } from '../languages/index.js';
import ResultParser from './ResultParser.js';

const execAsync = promisify(exec);

export class ProcessSandbox {
  constructor() {
    this.parser = new ResultParser();
  }

  async execute(submission) {
    const { token, source_code, language, stdin, cpu_time_limit } = submission;
    const timeoutSeconds = cpu_time_limit || language.default_cpu_limit || 3.0;
    const timeoutMs = Math.round(timeoutSeconds * 1000);

    // Ephemeral isolated working directory
    const scratchDir = path.join(os.tmpdir(), 'codebox', token);
    await fs.mkdir(scratchDir, { recursive: true });

    const sourcePath = path.join(scratchDir, language.source_file);
    await fs.writeFile(sourcePath, source_code || '', 'utf-8');

    try {
      // 1. Compilation phase if required
      if (language.compile_cmd) {
        try {
          await execAsync(language.compile_cmd, {
            cwd: scratchDir,
            timeout: timeoutMs + 2000,
            maxBuffer: 10 * 1024 * 1024,
          });
        } catch (compileErr) {
          const compileOutput = compileErr.stderr || compileErr.stdout || compileErr.message;
          return {
            status: getStatusById(6), // Compilation Error
            stdout: null,
            stderr: null,
            compile_output: compileOutput,
            time: 0,
            memory: 0,
            exit_code: compileErr.code || 1,
          };
        }
      }

      // 2. Execution phase with resource limits and stdin
      const startTime = process.hrtime.bigint();
      const runResult = await this.runProcess(language.run_cmd, scratchDir, stdin || '', timeoutMs);
      const endTime = process.hrtime.bigint();
      const executionTime = Number(endTime - startTime) / 1e9; // in seconds

      const parsed = this.parser.parseExecutionResult(runResult);

      return {
        ...parsed,
        compile_output: null,
        time: parseFloat(executionTime.toFixed(3)),
        memory: Math.round(process.memoryUsage().heapUsed / 1024), // Memory KB
      };
    } finally {
      // Immediate scratchpad cleanup
      try {
        await fs.rm(scratchDir, { recursive: true, force: true });
      } catch (err) {
        logger.warn({ token, err: err.message }, 'Failed to clean scratchpad directory');
      }
    }
  }

  runProcess(command, cwd, stdin, timeoutMs) {
    return new Promise((resolve) => {
      const [cmd, ...args] = command.split(' ');
      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const child = spawn(cmd, args, {
        cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const timer = setTimeout(() => {
        timedOut = true;
        child.kill('SIGKILL');
      }, timeoutMs);

      if (stdin) {
        child.stdin.write(stdin);
      }
      child.stdin.end();

      child.stdout.on('data', (data) => {
        if (stdout.length < 10 * 1024 * 1024) stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        if (stderr.length < 10 * 1024 * 1024) stderr += data.toString();
      });

      child.on('close', (code, signal) => {
        clearTimeout(timer);
        resolve({
          exitCode: code,
          signal,
          timedOut,
          stdout,
          stderr,
        });
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        resolve({
          exitCode: 1,
          signal: null,
          timedOut: false,
          stdout,
          stderr: stderr || err.message,
        });
      });
    });
  }
}

export default ProcessSandbox;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test server/tests/executor.test.js`
Expected: PASS (all 4 execution tests pass)

- [ ] **Step 5: Commit**

```bash
git add server/src/executor/ server/tests/executor.test.js
git commit -m "feat(server): implement sandboxed process executor with timeout and memory tracking"
```

---

### Task 6: Queue & Execution Pipeline (BullMQ with In-Memory Fallback)

**Files:**
- Create: `server/src/queue/inMemoryQueue.js`
- Create: `server/src/queue/producer.js`
- Create: `server/src/queue/worker.js`
- Test: `server/tests/queue.test.js`

**Interfaces:**
- Consumes: Submission payload
- Produces: `initializeQueue()`, `addSubmission(submission)`, `getSubmission(token)`, `closeQueue()`

- [ ] **Step 1: Write tests for submission queue and token polling**

Create `server/tests/queue.test.js`:
```javascript
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
```

- [ ] **Step 2: Run test to verify failure**

Run: `node --test server/tests/queue.test.js`
Expected: FAIL

- [ ] **Step 3: Implement `inMemoryQueue.js`, `producer.js`, and `worker.js`**

`server/src/queue/inMemoryQueue.js`:
```javascript
import logger from '../utils/logger.js';

class InMemoryQueue {
  constructor() {
    this.jobs = [];
    this.results = new Map();
    this.handlers = [];
    this.running = false;
  }

  async add(submission) {
    this.results.set(submission.token, {
      ...submission,
      status: { id: 1, description: 'In Queue' },
    });
    this.jobs.push(submission);
    this.processNext();
    return submission;
  }

  async get(token) {
    return this.results.get(token) || null;
  }

  async set(token, result) {
    this.results.set(token, result);
  }

  onProcess(handler) {
    this.handlers.push(handler);
    this.processNext();
  }

  async processNext() {
    if (this.running || this.jobs.length === 0 || this.handlers.length === 0) return;
    this.running = true;
    const job = this.jobs.shift();
    const handler = this.handlers[0];

    try {
      this.results.set(job.token, { ...job, status: { id: 2, description: 'Processing' } });
      const result = await handler(job);
      this.results.set(job.token, result);
    } catch (err) {
      logger.error({ token: job.token, err: err.message }, 'In-memory job processing failed');
    } finally {
      this.running = false;
      this.processNext();
    }
  }

  async close() {
    this.jobs = [];
    this.handlers = [];
  }
}

export const inMemoryQueue = new InMemoryQueue();
```

`server/src/queue/producer.js`:
```javascript
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import config from '../utils/config.js';
import logger from '../utils/logger.js';
import { inMemoryQueue } from './inMemoryQueue.js';

let redis = null;
let submissionQueue = null;

export async function initializeQueue() {
  if (config.redisUrl) {
    try {
      redis = new Redis(config.redisUrl, { maxRetriesPerRequest: null });
      submissionQueue = new Queue('submissions', { connection: redis });
      logger.info('Connected to Redis BullMQ queue');
      return;
    } catch (err) {
      logger.warn({ err: err.message }, 'Failed to connect to Redis; falling back to in-memory queue');
    }
  }
  logger.info('Using in-memory queue fallback (no external Redis)');
}

export async function addSubmission(submission) {
  if (submissionQueue && redis) {
    await redis.set(`sub:${submission.token}`, JSON.stringify(submission), 'EX', 3600);
    await submissionQueue.add('execute', submission, { jobId: submission.token });
    return submission;
  }
  return inMemoryQueue.add(submission);
}

export async function getSubmission(token) {
  if (redis) {
    const raw = await redis.get(`sub:${token}`);
    return raw ? JSON.parse(raw) : null;
  }
  return inMemoryQueue.get(token);
}

export async function closeQueue() {
  if (submissionQueue) await submissionQueue.close();
  if (redis) await redis.quit();
  await inMemoryQueue.close();
}
```

`server/src/queue/worker.js`:
```javascript
import { Worker } from 'bullmq';
import Redis from 'ioredis';
import config from '../utils/config.js';
import logger from '../utils/logger.js';
import { inMemoryQueue } from './inMemoryQueue.js';
import { analyzeCode } from '../security/codeAnalyzer.js';
import { ProcessSandbox } from '../executor/ProcessSandbox.js';
import { getStatusById } from '../languages/index.js';

let bullWorker = null;
let redis = null;
const sandbox = new ProcessSandbox();

async function handleExecution(submission) {
  // Pre-execution security check
  const scan = analyzeCode(submission.source_code, submission.language_id);
  if (scan.rejected) {
    return {
      ...submission,
      status: getStatusById(6),
      compile_output: `Rejected by Security: ${scan.reason}`,
      stdout: null,
      stderr: null,
      time: 0,
      memory: 0,
      exit_code: 1,
    };
  }

  const result = await sandbox.execute(submission);
  return {
    ...submission,
    ...result,
  };
}

export async function startWorker() {
  if (config.redisUrl) {
    try {
      redis = new Redis(config.redisUrl, { maxRetriesPerRequest: null });
      bullWorker = new Worker(
        'submissions',
        async (job) => {
          const result = await handleExecution(job.data);
          await redis.set(`sub:${job.data.token}`, JSON.stringify(result), 'EX', 3600);
          return result;
        },
        { connection: redis, concurrency: 2 }
      );
      logger.info('BullMQ worker initialized with concurrency 2');
      return;
    } catch (err) {
      logger.warn({ err: err.message }, 'Failed to start BullMQ worker, using in-memory handler');
    }
  }

  inMemoryQueue.onProcess(handleExecution);
}

export async function stopWorker() {
  if (bullWorker) await bullWorker.close();
  if (redis) await redis.quit();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test server/tests/queue.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/src/queue/ server/tests/queue.test.js
git commit -m "feat(server): build BullMQ and in-memory queue execution pipeline"
```

---

### Task 7: Express API Server, Rate Limiter & Endpoints

**Files:**
- Create: `server/src/api/middleware/rateLimiter.js`
- Create: `server/src/api/routes/submissions.js`
- Create: `server/src/api/routes/languages.js`
- Create: `server/src/api/routes/health.js`
- Create: `server/src/api/server.js`
- Create: `server/src/index.js`
- Test: `server/tests/api.test.js`

**Interfaces:**
- Consumes: HTTP requests
- Produces: REST API on `POST /submissions`, `GET /submissions/:token`, `GET /languages`, `GET /health`

- [ ] **Step 1: Write integration tests for API endpoints**

Create `server/tests/api.test.js`:
```javascript
import { test, before, after } from 'node:test';
import assert from 'node:assert';
import { startServer, stopServer } from '../src/api/server.js';
import config from '../src/utils/config.js';

let baseUrl;

before(async () => {
  const app = await startServer(0); // Random port
  const port = app.address().port;
  baseUrl = `http://localhost:${port}`;
});

after(async () => {
  await stopServer();
});

test('GET /health returns 200 OK', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status, 'ok');
});

test('GET /languages returns all 6 core languages', async () => {
  const res = await fetch(`${baseUrl}/languages`);
  assert.strictEqual(res.status, 200);
  const langs = await res.json();
  assert.strictEqual(langs.length, 6);
});

test('POST /submissions executes code synchronously with wait=true', async () => {
  const payload = {
    language_id: 63,
    source_code: Buffer.from('console.log("Sync output");').toString('base64'),
    stdin: '',
  };
  const res = await fetch(`${baseUrl}/submissions?wait=true&base64_encoded=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status.id, 3);
  assert.strictEqual(Buffer.from(data.stdout, 'base64').toString().trim(), 'Sync output');
});

test('POST /submissions returns token for polling when wait=false', async () => {
  const payload = {
    language_id: 71,
    source_code: Buffer.from('print(100 + 200)').toString('base64'),
    stdin: '',
  };
  const createRes = await fetch(`${baseUrl}/submissions?wait=false&base64_encoded=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  assert.strictEqual(createRes.status, 201);
  const { token } = await createRes.json();
  assert.ok(token);

  // Poll GET /submissions/:token
  let pollData = null;
  for (let i = 0; i < 20; i++) {
    const pollRes = await fetch(`${baseUrl}/submissions/${token}?base64_encoded=true`);
    if (pollRes.status === 200) {
      pollData = await pollRes.json();
      if (pollData.status && pollData.status.id >= 3) break;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  assert.strictEqual(pollData.status.id, 3);
  assert.strictEqual(Buffer.from(pollData.stdout, 'base64').toString().trim(), '300');
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `node --test server/tests/api.test.js`
Expected: FAIL

- [ ] **Step 3: Implement middleware, routes, and server**

`server/src/api/middleware/rateLimiter.js`:
```javascript
import rateLimit from 'express-rate-limit';
import config from '../../utils/config.js';

export const submissionRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: `Rate limit exceeded. Maximum ${config.rateLimit.max} submissions per minute.`,
  },
});
```

`server/src/api/routes/languages.js`:
```javascript
import { Router } from 'express';
import { getAllLanguages } from '../../languages/index.js';

const router = Router();
router.get('/', (req, res) => {
  res.json(getAllLanguages());
});
export default router;
```

`server/src/api/routes/health.js`:
```javascript
import { Router } from 'express';

const router = Router();
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
export default router;
```

`server/src/api/routes/submissions.js`:
```javascript
import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { addSubmission, getSubmission } from '../../queue/producer.js';
import { getLanguageById, getStatusById } from '../../languages/index.js';
import { decodeIfNeeded, encodeIfNeeded } from '../../utils/base64.js';
import { submissionRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

function formatSubmission(sub, isBase64) {
  return {
    token: sub.token,
    status: sub.status || getStatusById(1),
    stdout: encodeIfNeeded(sub.stdout, isBase64),
    stderr: encodeIfNeeded(sub.stderr, isBase64),
    compile_output: encodeIfNeeded(sub.compile_output, isBase64),
    time: sub.time || null,
    memory: sub.memory || null,
    exit_code: sub.exit_code ?? null,
  };
}

router.post('/', submissionRateLimiter, async (req, res, next) => {
  try {
    const { language_id, source_code, stdin } = req.body;
    const isBase64 = req.query.base64_encoded === 'true';
    const isWait = req.query.wait === 'true';

    const language = getLanguageById(language_id);
    if (!language) {
      return res.status(400).json({ error: 'Bad Request', message: `Unsupported language id: ${language_id}` });
    }

    const decodedSource = decodeIfNeeded(source_code, isBase64);
    const decodedStdin = decodeIfNeeded(stdin, isBase64);

    const submission = {
      token: uuidv4(),
      language_id,
      language,
      source_code: decodedSource,
      stdin: decodedStdin,
      created_at: new Date().toISOString(),
      status: getStatusById(1),
    };

    await addSubmission(submission);

    if (isWait) {
      const maxWait = 25000;
      const start = Date.now();
      while (Date.now() - start < maxWait) {
        const result = await getSubmission(submission.token);
        if (result && result.status && result.status.id >= 3) {
          return res.json(formatSubmission(result, isBase64));
        }
        await new Promise((r) => setTimeout(r, 100));
      }
      return res.status(504).json({ error: 'Gateway Timeout', message: 'Execution timed out' });
    }

    res.status(201).json({ token: submission.token });
  } catch (err) {
    next(err);
  }
});

router.get('/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    const isBase64 = req.query.base64_encoded === 'true';
    const sub = await getSubmission(token);

    if (!sub) {
      return res.status(404).json({ error: 'Not Found', message: 'Submission not found' });
    }

    res.json(formatSubmission(sub, isBase64));
  } catch (err) {
    next(err);
  }
});

export default router;
```

`server/src/api/server.js`:
```javascript
import express from 'express';
import cors from 'cors';
import config from '../utils/config.js';
import logger from '../utils/logger.js';
import submissionsRouter from './routes/submissions.js';
import languagesRouter from './routes/languages.js';
import healthRouter from './routes/health.js';
import { initializeQueue, closeQueue } from '../queue/producer.js';
import { startWorker, stopWorker } from '../queue/worker.js';

let serverInstance = null;

export async function startServer(port = config.port) {
  await initializeQueue();
  await startWorker();

  const app = express();
  app.use(cors({ origin: config.clientUrl }));
  app.use(express.json({ limit: '10mb' }));

  app.use('/health', healthRouter);
  app.use('/languages', languagesRouter);
  app.use('/submissions', submissionsRouter);

  // Global error handler
  app.use((err, req, res, next) => {
    logger.error({ err: err.message }, 'Unhandled error');
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  });

  return new Promise((resolve) => {
    serverInstance = app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
      resolve(serverInstance);
    });
  });
}

export async function stopServer() {
  if (serverInstance) {
    await new Promise((resolve) => serverInstance.close(resolve));
  }
  await stopWorker();
  await closeQueue();
}
```

`server/src/index.js`:
```javascript
import { startServer } from './api/server.js';
import config from './utils/config.js';

startServer(config.port).catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test server/tests/api.test.js`
Expected: PASS (all API integration tests pass)

- [ ] **Step 5: Commit**

```bash
git add server/src/api/ server/src/index.js server/tests/api.test.js
git commit -m "feat(server): build Express REST API, rate limiter, and endpoints"
```

---

### Task 8: Production Multi-Language Dockerfile for Railway

**Files:**
- Create: `server/Dockerfile`

**Interfaces:**
- Consumes: Ubuntu 22.04 base image
- Produces: Self-contained multi-runtime container for Railway

- [ ] **Step 1: Create `server/Dockerfile`**

```dockerfile
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production

# 1. System packages & compiler runtimes (GCC, G++, Java 17, Python 3)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ \
    openjdk-17-jdk-headless \
    python3 \
    curl ca-certificates time \
    && rm -rf /var/lib/apt/lists/*

# 2. Node.js 20 LTS
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# 3. TypeScript global compiler
RUN npm install -g typescript

# 4. Create unprivileged runner user
RUN useradd -m -u 1001 -s /bin/bash runner \
    && mkdir -p /tmp/codebox \
    && chown -R runner:runner /tmp/codebox

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

EXPOSE 5001
CMD ["node", "src/index.js"]
```

- [ ] **Step 2: Commit**

```bash
git add server/Dockerfile
git commit -m "feat(server): add production Dockerfile for Railway with multi-language runtimes"
```

---

### Task 9: Frontend API Client & Core Constants Update

**Files:**
- Modify: `client/src/constants/languages.js`
- Modify: `client/src/boilerCodes/index.js`
- Modify: `client/src/api/index.js`
- Create: `client/.env.example`
- Create: `client/.env.local`

**Interfaces:**
- Consumes: Server API endpoints
- Produces: Cleaned 6 core languages, tested boilerplates, `submitCode` & `checkStatus` connecting to `REACT_APP_API_URL`

- [ ] **Step 1: Update `client/src/constants/languages.js` to 6 core languages**

```javascript
export const LANGUAGES = [
  { id: 54, name: "C++", label: "C++", value: "cpp" },
  { id: 62, name: "Java", label: "Java", value: "java" },
  { id: 71, name: "Python 3", label: "Python 3", value: "python" },
  { id: 63, name: "JavaScript", label: "JavaScript", value: "javascript" },
  { id: 74, name: "TypeScript", label: "TypeScript", value: "typescript" },
  { id: 50, name: "C", label: "C", value: "c" },
];
```

- [ ] **Step 2: Update `client/src/boilerCodes/index.js`**

```javascript
export const cppBoiler = `#include <iostream>
using namespace std;

int main() {
    cout << "Hello LeetCode C++!" << endl;
    return 0;
}
`;

export const javaBoiler = `public class Solution {
    public static void main(String[] args) {
        System.out.println("Hello LeetCode Java!");
    }
}
`;

export const pyBoiler = `print("Hello LeetCode Python!")
`;

export const jsBoiler = `console.log("Hello LeetCode JavaScript!");
`;

export const tsBoiler = `const greeting: string = "Hello LeetCode TypeScript!";
console.log(greeting);
`;

export const cBoiler = `#include <stdio.h>

int main() {
    printf("Hello LeetCode C!\\n");
    return 0;
}
`;

export const boilerCodes = (languageId) => {
  switch (Number(languageId)) {
    case 54:
      return cppBoiler;
    case 62:
      return javaBoiler;
    case 71:
      return pyBoiler;
    case 63:
      return jsBoiler;
    case 74:
      return tsBoiler;
    case 50:
      return cBoiler;
    default:
      return jsBoiler;
  }
};
```

- [ ] **Step 3: Update `client/src/api/index.js`**

```javascript
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

export const submitCode = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/submissions?base64_encoded=true`, formData);
    return { success: true, data: response.data };
  } catch (err) {
    const message = err.response?.data?.message || err.message;
    return { success: false, err: message, status: err.response?.status };
  }
};

export const checkStatus = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/submissions/${token}?base64_encoded=true`);
    const statusId = response.data.status?.id;

    if (statusId === 1 || statusId === 2) {
      // In Queue or Processing - poll after 1s
      await new Promise((r) => setTimeout(r, 1000));
      return checkStatus(token);
    }
    return { success: true, data: response.data };
  } catch (err) {
    const message = err.response?.data?.message || err.message;
    return { success: false, err: message };
  }
};
```

- [ ] **Step 4: Add `client/.env.example` and `client/.env.local`**

`.env.example`:
```env
REACT_APP_API_URL=http://localhost:5001
```

`.env.local`:
```env
REACT_APP_API_URL=http://localhost:5001
```

- [ ] **Step 5: Commit**

```bash
git add client/src/constants/languages.js client/src/boilerCodes/index.js client/src/api/index.js client/.env.example client/.env.local
git commit -m "feat(client): connect API to custom execution service and streamline core languages"
```

---

### Task 10: LocalStorage Code Persistence Utility

**Files:**
- Create: `client/src/utils/storage.js`

**Interfaces:**
- Consumes: `languageId`, code strings, user preferences
- Produces: `getSavedCode(id, defaultCode)`, `saveCode(id, code)`, `getSavedStdin(id)`, `saveStdin(id, stdin)`, `resetSavedCode(id)`

- [ ] **Step 1: Implement `client/src/utils/storage.js`**

```javascript
const CODE_PREFIX = "leetcode_ide_code_";
const STDIN_PREFIX = "leetcode_ide_stdin_";
const LAST_LANG_KEY = "leetcode_ide_last_lang";
const LAST_THEME_KEY = "leetcode_ide_last_theme";

export const getSavedCode = (languageId, defaultCode = "") => {
  try {
    const saved = localStorage.getItem(`${CODE_PREFIX}${languageId}`);
    return saved !== null ? saved : defaultCode;
  } catch (e) {
    return defaultCode;
  }
};

export const saveCode = (languageId, code) => {
  try {
    localStorage.setItem(`${CODE_PREFIX}${languageId}`, code);
  } catch (e) {
    console.warn("LocalStorage quota exceeded or unavailable");
  }
};

export const resetSavedCode = (languageId) => {
  try {
    localStorage.removeItem(`${CODE_PREFIX}${languageId}`);
  } catch (e) {}
};

export const getSavedStdin = (languageId) => {
  try {
    return localStorage.getItem(`${STDIN_PREFIX}${languageId}`) || "";
  } catch (e) {
    return "";
  }
};

export const saveStdin = (languageId, stdin) => {
  try {
    localStorage.setItem(`${STDIN_PREFIX}${languageId}`, stdin);
  } catch (e) {}
};

export const getSavedLanguage = (defaultLang) => {
  try {
    const saved = localStorage.getItem(LAST_LANG_KEY);
    return saved ? JSON.parse(saved) : defaultLang;
  } catch (e) {
    return defaultLang;
  }
};

export const saveLanguage = (lang) => {
  try {
    localStorage.setItem(LAST_LANG_KEY, JSON.stringify(lang));
  } catch (e) {}
};
```

- [ ] **Step 2: Commit**

```bash
git add client/src/utils/storage.js
git commit -m "feat(client): implement localStorage code persistence manager"
```

---

### Task 11: LeetCode Dark Theme & UI Components Overhaul

**Files:**
- Modify: `client/src/components/Navbar/Navbar.js`
- Modify: `client/src/components/CodeOutput/CodeOutput.js`
- Modify: `client/src/components/CodeInput/CodeInput.js`
- Modify: `client/src/components/CodeEditor/CodeEditor.js`
- Modify: `client/src/App.js`
- Modify: `client/src/App.css`
- Modify: `client/src/index.css`

**Interfaces:**
- Consumes: React states, LocalStorage utils, API client
- Produces: Polished LeetCode dark theme, tabs for testcase and results, telemetry badges, reset button, rate limit warning

- [ ] **Step 1: Enhance `Navbar.js` with Run Spinner & Reset Button**

Include LeetCode dark navbar (`bg-[#282828]`), Run button with loading spinner (`#2cbb5d`), Reset button to restore boilerplate, and language dropdown.

- [ ] **Step 2: Upgrade Output Console with Testcase / Result Tabs & Telemetry**

Display Status Badge (`Accepted`, `Time Limit Exceeded`, `Compilation Error`, `Runtime Error`), Runtime (`ms`), and Memory (`MB`), formatted cleanly inside a dark monospace terminal box (`bg-[#1e1e1e]`).

- [ ] **Step 3: Wire Auto-save & LocalStorage into `App.js`**

On keystroke, debounced save to `localStorage`. On language change, load that language's saved code or boilerplate. Handle 429 rate limit error gracefully with alert.

- [ ] **Step 4: Test build client**

Run: `cd client && npm run build`
Expected: Compiled successfully

- [ ] **Step 5: Commit**

```bash
git add client/src/
git commit -m "feat(client): modernize LeetCode dark theme, console telemetry, and auto-save"
```

---

### Task 12: End-to-End Integration, Verification & Documentation

**Files:**
- Create: `docs/superpowers/specs/railway-deployment.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: Running client and server
- Produces: Complete end-to-end verified project with deployment documentation

- [ ] **Step 1: Run complete backend test suite**

Run: `npm test --prefix server`
Expected: 100% tests pass

- [ ] **Step 2: Verify full execution workflow**

Start backend (`cd server && npm start`) and frontend (`cd client && npm start`).
1. Execute sample code in all 6 languages.
2. Provide custom input in Testcase tab and verify output.
3. Test infinite loop for TLE handling.
4. Verify code persistence after browser reload.

- [ ] **Step 3: Update `README.md` with Architecture, Railway deployment steps, and .env details**

Document how to deploy on Railway with zero-cost Redis Cloud, how to run locally, and API details.

- [ ] **Step 4: Commit**

```bash
git add README.md docs/
git commit -m "docs: add comprehensive Railway deployment instructions and updated README"
```
