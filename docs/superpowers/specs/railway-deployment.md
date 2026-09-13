# Railway Platform Deployment & Operations Guide

This guide details how to deploy the sandboxed code execution service to the **Railway** platform within your **Hobby Plan ($10/month maximum budget)**, operating comfortably around **~$2.55 – $3.50/month** (which is 100% covered by Railway's $5 included usage).

---

## 1. Architectural Overview

```
                         +-----------------------------------+
                         |   Vercel / Netlify / Railway      |
                         |   React Client (client/)          |
                         +-----------------+-----------------+
                                           |
                                           | HTTPS REST (btoa)
                                           v
+------------------------------------------------------------------------------------+
| Railway Docker Service (server/)                                                   |
| - Resource Target: 512MB RAM, 0.5 vCPU (~$2.55 - $3.50/mo)                         |
| - Ubuntu 22.04 LTS Container                                                       |
| - Runtimes: GCC (C/C++), OpenJDK 17 (Java), Python 3, Node.js 20, TypeScript       |
| - Security: Unprivileged `runner` user, ephemeral scratchpad isolation             |
| - Rate Limiter: Max 30 submissions / minute / IP                                   |
+------------------------------------------+-----------------------------------------+
                                           |
                                           | BullMQ Jobs & Caching
                                           v
                         +-----------------------------------+
                         | Redis Cloud (Free 30MB forever)   |
                         | or Railway Valkey Container       |
                         | (or In-Memory Queue fallback)     |
                         +-----------------------------------+
```

---

## 2. Zero-Cost Redis Setup (Redis Cloud)

You do **not** need to pay for a Redis instance on Railway. Use Redis Cloud's free tier:
1. Sign up for a free account at [Redis Cloud](https://redis.io/cloud/).
2. Click **Create Database** -> Choose the free **30MB plan** on AWS or GCP.
3. Once active, copy the **Public Endpoint** URL:
   ```
   redis://default:<password>@<host>:<port>
   ```
4. *(Fallback)*: If `REDIS_URL` is omitted, the server automatically uses its built-in in-memory queue.

---

## 3. Step-by-Step Railway Deployment

### Step 1: Create New Railway Project
1. Log into your [Railway Dashboard](https://railway.app).
2. Click **New Project** -> Select **Deploy from GitHub repo**.
3. Select your repository: `Leetcode-Ide`.

### Step 2: Configure Service Settings
1. Click on the newly created service tile -> Go to the **Settings** tab.
2. Under **General**:
   - **Service Name**: `leetcode-ide-server` (or whatever you prefer).
   - **Root Directory**: Set to `/server`.
3. Under **Build**:
   - Railway will automatically detect `server/Dockerfile`.
4. Under **Deploy**:
   - Set **Restart Policy**: `On failure`.

### Step 3: Configure Environment Variables
In the **Variables** tab of your service, add:

| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Optimizes Node runtime and logging |
| `PORT` | `5001` | Server port (Railway sets this or routes to it) |
| `CLIENT_URL` | `https://leetcode-ide.vercel.app` | Allows CORS requests from your frontend |
| `REDIS_URL` | `redis://default:password@host:port` | Connection to Redis Cloud (or blank for in-memory) |
| `RATE_LIMIT_WINDOW_MS` | `60000` | 1 minute window |
| `RATE_LIMIT_MAX` | `30` | 30 submissions per minute per IP |
| `EXECUTION_TIMEOUT_MS` | `5000` | 5.0 seconds maximum execution time |
| `MAX_MEMORY_MB` | `256` | 256MB memory cap per execution process |

### Step 4: Cost & Limit Protection ($10 Budget)
1. In your **Account / Workspace Settings** -> **Billing**:
   - Under **Usage Limits**, ensure the monthly budget cap is set to **`$10.00`**.
2. In the service's **Settings** -> **Resource Limits**:
   - Limit Memory: **512 MB**
   - Limit vCPU: **0.5 vCPU**
   - *Result*: Monthly usage cost is ~0.5 GB × 730 hrs × $0.000231 ≈ **$2.55/month**, safely within the $5 free included credit!

### Step 5: Expose Public Domain
1. In the service's **Networking** tab, click **Generate Domain**.
2. You will receive an address like: `https://leetcode-ide-server-production.up.railway.app`.
3. Test health check:
   ```bash
   curl https://<your-domain>.up.railway.app/health
   # Response: {"status":"ok","uptime":...}
   ```

---

## 4. Frontend Client Deployment

When hosting the React client (on Vercel, Netlify, or Railway):
1. Add the environment variable:
   ```env
   REACT_APP_API_URL=https://<your-railway-domain>.up.railway.app
   ```
2. Redeploy the client.
3. You can completely remove the old Judge0 RapidAPI keys (`REACT_APP_RAPID_API_KEY`, `REACT_APP_RAPID_API_HOST`).

---

## 5. Local Development Setup

To run everything on your local machine:

1. **Terminal 1: Start Execution Backend**:
   ```bash
   cd server
   cp .env.example .env.local
   npm install
   npm run dev
   # Server starts on http://localhost:5001 with in-memory queue fallback
   ```

2. **Terminal 2: Start React Frontend**:
   ```bash
   cd client
   cp .env.example .env.local
   npm install
   npm start
   # Web app opens on http://localhost:3000
   ```
