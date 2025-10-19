import Bull from 'bull';
import { logger } from './utils/logger';
import { emailQueue } from './queues/emailQueue';
import { imageProcessingQueue } from './queues/imageProcessingQueue';
import { cleanupQueue } from './queues/cleanupQueue';

// Initialize queues
const queues = [emailQueue, imageProcessingQueue, cleanupQueue];

// Process email jobs
emailQueue.process('send-welcome-email', async (job) => {
  const { email, name } = job.data;
  logger.info('Processing welcome email', { email, name });
  
  // Simulate email sending
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  logger.info('Welcome email sent successfully', { email });
});

emailQueue.process('send-order-confirmation', async (job) => {
  const { email, orderId, total } = job.data;
  logger.info('Processing order confirmation email', { email, orderId, total });
  
  // Simulate email sending
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  logger.info('Order confirmation email sent successfully', { email, orderId });
});

// Process image processing jobs
imageProcessingQueue.process('resize-image', async (job) => {
  const { imageUrl, sizes } = job.data;
  logger.info('Processing image resize', { imageUrl, sizes });
  
  // Simulate image processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  logger.info('Image resized successfully', { imageUrl });
});

imageProcessingQueue.process('optimize-image', async (job) => {
  const { imageUrl, quality } = job.data;
  logger.info('Processing image optimization', { imageUrl, quality });
  
  // Simulate image optimization
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  logger.info('Image optimized successfully', { imageUrl });
});

// Process cleanup jobs
cleanupQueue.process('cleanup-expired-sessions', async (job) => {
  logger.info('Processing session cleanup');
  
  // Simulate cleanup
  await new Promise(resolve => setTimeout(resolve, 500));
  
  logger.info('Expired sessions cleaned up successfully');
});

cleanupQueue.process('cleanup-temp-files', async (job) => {
  logger.info('Processing temp files cleanup');
  
  // Simulate cleanup
  await new Promise(resolve => setTimeout(resolve, 300));
  
  logger.info('Temp files cleaned up successfully');
});

// Queue event handlers
queues.forEach(queue => {
  queue.on('completed', (job) => {
    logger.info('Job completed', { 
      queue: queue.name, 
      jobId: job.id, 
      jobName: job.name 
    });
  });

  queue.on('failed', (job, err) => {
    logger.error('Job failed', { 
      queue: queue.name, 
      jobId: job.id, 
      jobName: job.name, 
      error: err.message 
    });
  });

  queue.on('stalled', (job) => {
    logger.warn('Job stalled', { 
      queue: queue.name, 
      jobId: job.id, 
      jobName: job.name 
    });
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  await Promise.all(queues.map(queue => queue.close()));
  
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  await Promise.all(queues.map(queue => queue.close()));
  
  process.exit(0);
});

logger.info('Worker started successfully', {
  queues: queues.map(q => q.name),
  environment: process.env.NODE_ENV,
});
