# Contributing to CodePad

Thank you for your interest in contributing to **CodePad**! Whether you are fixing a bug, adding support for a new programming language, optimizing execution speed, or improving sandbox security, we appreciate your help in building a best-in-class open-source competitive programming IDE.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Local Development Setup](#local-development-setup)
- [Development Workflow](#development-workflow)
- [Testing & Quality Standards](#testing--quality-standards)
- [Guide: How to Add a New Programming Language](#guide-how-to-add-a-new-programming-language)
- [Guide: How to Extend the Security Auditor](#guide-how-to-extend-the-security-auditor)
- [Submitting a Pull Request](#submitting-a-pull-request)

---

## Code of Conduct

Please be respectful, collaborative, and constructive when opening issues, submitting pull requests, and participating in code reviews. Treat all contributors with empathy and patience.

---

## Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/<your-username>/Leetcode-Ide.git
   cd Leetcode-Ide
   ```
3. **Set the upstream remote**:
   ```bash
   git remote add upstream https://github.com/abhinandanmishra1/Leetcode-Ide.git
   ```
4. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

---

## Local Development Setup

CodePad consists of two main parts:
- **`client/`**: React 18 frontend with Vite, Tailwind CSS, and Monaco Editor.
- **`server/`**: Node.js 20 backend execution service with BullMQ, ProcessSandbox, and the 20-Category Security Auditor.

For comprehensive, step-by-step local setup instructions, refer to the [Quick Start (Local Development) section in README.md](README.md#quick-start-local-development).

### Quick Summary

1. **Start Backend**:
   ```bash
   cd server
   cp .env.example .env.local
   npm install
   npm run dev
   ```
   *(Runs on `http://localhost:5001` with zero-config in-memory queue fallback).*

2. **Start Frontend**:
   ```bash
   cd client
   cp .env.example .env.local
   npm install
   npm start
   ```
   *(Runs on `http://localhost:3000` connected to `http://localhost:5001`).*

---

## Development Workflow

### Git Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new user-facing feature or language support.
- `fix:` A bugfix in frontend, backend, or compilers.
- `docs:` Documentation updates, guides, or README enhancements.
- `test:` Adding or refactoring unit and integration tests.
- `refactor:` Code changes that neither fix a bug nor add a feature.
- `chore:` Dependency bumps, CI/CD tweaks, or build configurations.

Examples:
```bash
git commit -m "feat(languages): add Rust 1.75 support"
git commit -m "fix(security): prevent shell metacharacter injection in compiler flags"
git commit -m "test(executor): add test for zero-division handling in Python"
```

---

## Testing & Quality Standards

Before submitting any Pull Request, verify that all test suites pass without error:

### 1. Backend Automated Tests
```bash
cd server
npm test
```
- Ensure **all 52+ tests pass**.
- Verify that your changes do not introduce regressions in security auditing, compiler invocations, or queue processing.

### 2. Frontend Production Build
```bash
cd client
npm run build
```
- Ensure `vite build` completes with **0 errors and 0 warnings**.
- Verify that assets and bundle chunks build cleanly.

---

## Guide: How to Add a New Programming Language

Adding a new language to CodePad involves updating both the execution engine (`server/`) and the editor UI (`client/`). Follow this step-by-step checklist:

### Step 1: Create Language Definition (`server/src/languages/`)
Create a new file, e.g., `server/src/languages/rust.js`:

```javascript
export default {
  id: 73,                                    // Unique integer language ID
  name: 'Rust (1.75+)',                      // Display name with version
  label: 'Rust',                             // UI selector label
  value: 'rust',                             // Language slug
  source_file: 'Solution.rs',                // Source file name written in scratchpad
  compile_cmd: 'rustc -O Solution.rs -o Solution', // Compilation command (or null for interpreted)
  run_cmd: './Solution',                     // Execution command
  default_cpu_limit: 2.0,                    // CPU time limit in seconds
  default_memory_limit: 262144,              // Memory ceiling (KB)
  resolve(sourceCode) {                      // Optional source preprocessor
    return { source_code: sourceCode };
  },
};
```

### Step 2: Register in Language Registry (`server/src/languages/index.js`)
Import the new language definition and include it in `languagesList`:
```javascript
import rust from './rust.js';

const languagesList = [cpp, java, python, javascript, typescript, c, rust];
```

### Step 3: Add Security Patterns (`server/src/security/codeAnalyzer.js`)
If the language has distinct system APIs, command execution functions, or dangerous constructs:
- Add patterns to the relevant categories in `codeAnalyzer.js` (e.g. `std::process::Command` in Category 2).
- Ensure benign CP solutions (e.g. `std::io::stdin`, vectors, math) pass without false positives.

### Step 4: Add Backend Tests (`server/tests/`)
- Add a language test in `server/tests/languages.test.js`.
- Add an execution test in `server/tests/executor.test.js`.
- Add a security test in `server/tests/security.test.js`.

### Step 5: Add Starter Boilerplate (`client/src/boilerCodes/index.js`)
Provide an idiomatic starter template that demonstrates standard competitive programming I/O:
```javascript
export const rustBoilerplate = `// CodePad Starter Template - Rust
use std::io::{self, Read};

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();
    let mut tokens = input.split_whitespace();

    // 1. Read input
    if let Some(token) = tokens.next() {
        println!("Received: {}", token);
    }
}
`;
```

### Step 6: Register in Frontend Selectors
- Add the language configuration to `client/src/constants/languageOptions.js`.
- Add Monaco syntax highlighting mapping in `client/src/components/CodeEditor/CodeEditor.jsx`.

### Step 7: Update Container Runtimes (`server/Dockerfile`)
If the language requires a system package, install it in `server/Dockerfile` (e.g., `apt-get install -y rustc`).

---

## Guide: How to Extend the Security Auditor

CodePad uses a multi-stage, 20-category pre-execution security auditor located at [`server/src/security/codeAnalyzer.js`](file:///Users/abhinandanmishra/personal/Leetcode-Ide/server/src/security/codeAnalyzer.js).

### The Threat Model
All submitted code is assumed to be untrusted and potentially hostile. The auditor checks:
1. Filesystem destruction (recursive deletion, device truncation)
2. Arbitrary command execution (`system`, `popen`, `exec`, `spawn`, `subprocess`)
3. Shell interpreter invocations (`/bin/sh`, `bash`, `cmd.exe`)
4. Command injection & dynamic chaining (pipes, backticks, `eval`)
5. Filesystem escape & traversal (`../`, symlinks)
6. Sensitive file access (`/etc/passwd`, `/etc/shadow`, `/proc/self`)
7. Secret & credential exfiltration (reading environment variables)
8. Network socket APIs (`socket`, `connect`, `http`, `curl`, `fetch`)
9. Reverse shells (bash socket redirection, netcat, python pty)
10. Privilege escalation (`setuid`, `sudo`, `doas`)
11. Container escape & namespace manipulation (`/proc/1/ns`, `cgroup`)
12. Process inspection & signaling (`ptrace`, `kill`, `SIGKILL`)
13. Fork bombs & resource exhaustion (`:(){ :|:& };:`, unbounded threads)
14. Dynamic code evaluation (`eval()`, `Function()`, `compile()`)
15. Obfuscated payload execution (Base64 decode + execute, hex escapes)
16. Native code loading (`dlopen`, `ctypes`, JNI)
17. Raw device access (`/dev/kmem`, `/dev/sda`)
18. Direct syscalls (`syscall`, `ioctl`)
19. Infinite output storm loops (unbounded print loops)
20. Sandbox boundary escapes (`chroot`, unshare)

### Adding a Rule
1. Locate the appropriate category array in `server/src/security/codeAnalyzer.js`.
2. Add regex patterns using word boundaries (`\b`) where appropriate.
3. Test against both malicious payloads AND benign competitive programming code in `server/tests/security.test.js`.

---

## Submitting a Pull Request

1. **Sync with Upstream**:
   ```bash
   git checkout main
   git pull upstream main
   git checkout feat/your-feature-name
   git rebase main
   ```
2. **Push your branch**:
   ```bash
   git push -u origin feat/your-feature-name
   ```
3. **Open a Pull Request**:
   - Go to [https://github.com/abhinandanmishra1/Leetcode-Ide/pulls](https://github.com/abhinandanmishra1/Leetcode-Ide/pulls).
   - Provide a clear, descriptive PR title (e.g. `feat(languages): add Go 1.22 support`).
   - Fill out the PR description with:
     - **Summary**: What changed and why.
     - **Verification**: Commands executed and test results.
     - **Screenshots / Logs**: If UI or CLI behavior changed.
4. **CI Checks**:
   - Wait for automated GitHub and Vercel preview checks to pass.
   - Address any reviewer feedback promptly.

Thank you for helping make CodePad faster, safer, and better for everyone!
