import Bull from 'bull';
import { logger } from '../utils/logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const emailQueue = new Bull('email', redisUrl, {
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// Add jobs to queue
export const addWelcomeEmailJob = (email: string, name: string) => {
  return emailQueue.add('send-welcome-email', { email, name }, {
    priority: 1,
    delay: 0,
  });
};

export const addOrderConfirmationJob = (email: string, orderId: string, total: number) => {
  return emailQueue.add('send-order-confirmation', { email, orderId, total }, {
    priority: 2,
    delay: 0,
  });
};

// Queue monitoring
emailQueue.on('waiting', (jobId) => {
  logger.info('Email job waiting', { jobId });
});

emailQueue.on('active', (job) => {
  logger.info('Email job active', { jobId: job.id, jobName: job.name });
});

emailQueue.on('completed', (job) => {
  logger.info('Email job completed', { jobId: job.id, jobName: job.name });
});

emailQueue.on('failed', (job, err) => {
  logger.error('Email job failed', { 
    jobId: job.id, 
    jobName: job.name, 
    error: err.message 
  });
});
