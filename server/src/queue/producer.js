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

export default {
  initializeQueue,
  addSubmission,
  getSubmission,
  closeQueue,
};
