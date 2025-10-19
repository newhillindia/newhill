import Bull from 'bull';
import { logger } from '../utils/logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const imageProcessingQueue = new Bull('image-processing', redisUrl, {
  defaultJobOptions: {
    removeOnComplete: 5,
    removeOnFail: 3,
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

// Add jobs to queue
export const addImageResizeJob = (imageUrl: string, sizes: number[]) => {
  return imageProcessingQueue.add('resize-image', { imageUrl, sizes }, {
    priority: 1,
    delay: 0,
  });
};

export const addImageOptimizationJob = (imageUrl: string, quality: number = 80) => {
  return imageProcessingQueue.add('optimize-image', { imageUrl, quality }, {
    priority: 2,
    delay: 0,
  });
};

// Queue monitoring
imageProcessingQueue.on('waiting', (jobId) => {
  logger.info('Image processing job waiting', { jobId });
});

imageProcessingQueue.on('active', (job) => {
  logger.info('Image processing job active', { jobId: job.id, jobName: job.name });
});

imageProcessingQueue.on('completed', (job) => {
  logger.info('Image processing job completed', { jobId: job.id, jobName: job.name });
});

imageProcessingQueue.on('failed', (job, err) => {
  logger.error('Image processing job failed', { 
    jobId: job.id, 
    jobName: job.name, 
    error: err.message 
  });
});
