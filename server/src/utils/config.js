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
