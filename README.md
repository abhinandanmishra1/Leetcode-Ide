# LeetCode IDE [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, full-stack clone of the LeetCode IDE with an in-house, sandboxed code execution backend (`server/`), interactive Monaco code editor, real-time runtime/memory telemetry, and auto-saving persistence.

[See Live Demo](https://leetcode-ide.vercel.app/)

---

## Highlights & Features

- **Self-Hosted Sandboxed Execution**: Replaced third-party Judge0 APIs with a dedicated, cost-efficient Node.js execution engine (`server/`).
- **Railway Budget Optimized**: Designed specifically for the Railway platform to operate under **~$2.55 – $3.50/month** (~512MB RAM), fully covered by Railway's $5 included monthly credit on the Hobby plan.
- **Core LeetCode Languages**:
  - **C++** (GCC 11+, C++17)
  - **Java** (OpenJDK 17)
  - **Python 3** (Python 3.10+)
  - **JavaScript** (Node.js 20 LTS)
  - **TypeScript** (TypeScript 5+ on Node 20)
  - **C** (GCC 11+)
- **Security & Sandboxing**:
  - Pre-execution static analysis (`codeAnalyzer.js`) blocking fork bombs, raw network sockets, `ptrace`, and sensitive system files (`/etc/passwd`, etc.).
  - Ephemeral scratchpad directory per execution (`/tmp/codebox/:token`) with immediate cleanup.
  - Process limits with strict wall-clock timeouts (default 5.0s) and 256MB memory ceilings.
- **Queue Pipeline & Zero-Cost Redis**:
  - Powered by **BullMQ** with Redis Cloud (free 30MB forever tier) or Valkey.
  - Automatic in-memory queue fallback for local development when no Redis is running.
- **Rate Limiting**:
  - Protected by `express-rate-limit` (max 30 submissions / minute / IP) with user-friendly countdown warnings in the UI.
- **LeetCode Dark Theme & UI**:
  - Authentic LeetCode dark aesthetic (`#1a1a1a` background, `#282828` navbar, `#2cbb5d` accents).
  - Interactive console with **Testcase (custom stdin)** and **Test Result** tabs.
  - Telemetry badges displaying exact **Runtime (ms)** and **Memory (MB)**.
- **LocalStorage Auto-Save**:
  - Automatically saves code and custom stdin per language as you type so you never lose progress on page reload.
  - "Reset" button to restore official starter boilerplate.

---

## Architecture

```
Leetcode-Ide/
├── client/                      # React Frontend (Monaco Editor & Console)
│   ├── src/
│   │   ├── api/                 # Connects to custom execution service
│   │   ├── components/          # Navbar, CodeEditor, ConsolePanel
│   │   ├── constants/           # 6 Core supported languages
│   │   ├── boilerCodes/         # Verified starter templates
│   │   └── utils/               # LocalStorage manager & formatters
│   ├── .env.example
│   └── package.json
├── server/                      # Sandboxed Execution Service
│   ├── src/
│   │   ├── api/                 # Express app, rate limiting, routes
│   │   ├── executor/            # Process sandbox & result parser
│   │   ├── languages/           # Compilers & runtimes mapping
│   │   ├── queue/               # BullMQ + In-Memory queue fallback
│   │   ├── security/            # Static code analyzer
│   │   └── utils/               # Config, Pino logger, base64 helpers
│   ├── tests/                   # 100% automated test suite
│   ├── Dockerfile               # Multi-runtime Ubuntu 22.04 container
│   ├── .env.example
│   └── package.json
└── docs/                        # Architecture & Railway deployment specs
```

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- Python 3 and GCC/G++ (optional, for running C++/Python locally)

### 1. Start Execution Backend
```bash
cd server
cp .env.example .env.local
npm install
npm run dev
```
*The server will start on `http://localhost:5001` using the internal in-memory queue.*

### 2. Start Frontend Client
```bash
cd client
cp .env.example .env.local
npm install
npm start
```
*The application will launch on `http://localhost:3000`.*

---

## Deployment Guide (Railway)

For complete instructions on deploying the execution service on Railway within your $10 budget, refer to the [Railway Deployment Guide](docs/superpowers/specs/railway-deployment.md).

---

## Testing

Run the full automated test suite for the execution service:
```bash
cd server
npm test
```
Verifies compilers, interpreters, execution timeouts, error captures, static security filters, and API endpoints.

---

## License
MIT
