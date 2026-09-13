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
export default inMemoryQueue;
