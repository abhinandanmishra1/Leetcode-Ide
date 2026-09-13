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
  logger.info({ token: submission.token, language: submission.language?.name }, `⚙️ Worker processing [${submission.language?.name || submission.language_id}]`);

  // Pre-execution security check
  const scan = analyzeCode(submission.source_code, submission.language_id);
  if (scan.rejected) {
    logger.warn({ token: submission.token, reason: scan.reason }, `🛡️ Code rejected by security scanner: ${scan.reason}`);
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
  logger.info(
    {
      token: submission.token,
      status: result.status?.description,
      status_id: result.status?.id,
      time: `${result.time}s`,
      memory: `${result.memory}KB`,
    },
    `✅ Execution finished: [${result.status?.description || 'Finished'}] (${result.time}s, ${result.memory}KB)`
  );

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
