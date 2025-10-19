import Bull from 'bull';
import { logger } from '../utils/logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const cleanupQueue = new Bull('cleanup', redisUrl, {
  defaultJobOptions: {
    removeOnComplete: 3,
    removeOnFail: 2,
    attempts: 1,
    repeat: {
      cron: '0 2 * * *', // Run daily at 2 AM
    },
  },
});

// Add jobs to queue
export const addSessionCleanupJob = () => {
  return cleanupQueue.add('cleanup-expired-sessions', {}, {
    priority: 1,
    delay: 0,
  });
};

export const addTempFilesCleanupJob = () => {
  return cleanupQueue.add('cleanup-temp-files', {}, {
    priority: 2,
    delay: 0,
  });
};

// Schedule recurring cleanup jobs
cleanupQueue.add('cleanup-expired-sessions', {}, {
  repeat: { cron: '0 2 * * *' }, // Daily at 2 AM
  jobId: 'daily-session-cleanup',
});

cleanupQueue.add('cleanup-temp-files', {}, {
  repeat: { cron: '0 3 * * *' }, // Daily at 3 AM
  jobId: 'daily-temp-files-cleanup',
});

// Queue monitoring
cleanupQueue.on('waiting', (jobId) => {
  logger.info('Cleanup job waiting', { jobId });
});

cleanupQueue.on('active', (job) => {
  logger.info('Cleanup job active', { jobId: job.id, jobName: job.name });
});

cleanupQueue.on('completed', (job) => {
  logger.info('Cleanup job completed', { jobId: job.id, jobName: job.name });
});

cleanupQueue.on('failed', (job, err) => {
  logger.error('Cleanup job failed', { 
    jobId: job.id, 
    jobName: job.name, 
    error: err.message 
  });
});
