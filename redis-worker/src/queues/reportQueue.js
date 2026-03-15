import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';

const defaultJobOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
};

const reportQueue = new Queue('report-generation', {
  connection: redisConnection,
  defaultJobOptions,
});

export default reportQueue;
