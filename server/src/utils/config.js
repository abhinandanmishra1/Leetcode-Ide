import dotenv from 'dotenv';
import path from 'path';

// Load .env.local if present, else .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function parseClientUrl(raw) {
  if (!raw || raw.trim() === '*' || raw.trim() === '') return '*';
  const urls = raw
    .split(',')
    .map((u) => u.trim().replace(/\/+$/, ''))
    .filter(Boolean);
  return urls.length === 1 ? urls[0] : urls;
}

export default {
  port: parseInt(process.env.PORT, 10) || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: parseClientUrl(process.env.CLIENT_URL),
  redisUrl: process.env.REDIS_URL || '',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 30,
  },
  executionTimeoutMs: parseInt(process.env.EXECUTION_TIMEOUT_MS, 10) || 5000,
  maxMemoryMb: parseInt(process.env.MAX_MEMORY_MB, 10) || 256,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/leetcode-ide',
  jwtSecret: process.env.JWT_SECRET || 'leetcode-ide-dev-jwt-secret-key-2026',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
};
