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

export default {
  startWorker,
  stopWorker,
};
