const Queue = require('bull');
const path = require('path');
const { Document, Task, sequelize } = require('../models');
require('dotenv').config();

// Queue configuration
const queueOptions = {
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
  settings: {
    stalledInterval: 30 * 1000,
    maxStalledCount: 1,
  },
  maxRetriesPerRequest: 10,
};

// Initialize queues
const imageQueue = new Queue('imageUpload', queueOptions);
const emailQueue = new Queue('email', queueOptions);

// Real image processing function (example with sharp)
const sharp = require('sharp');
async function processImage(filename, job) {
  try {
    const inputPath = path.join(__dirname, '../uploads', filename);
    const outputPath = path.join(__dirname, '../uploads/processed', filename);
    // Example: Resize image to 800px width
    await sharp(inputPath).resize({ width: 800 }).toFile(outputPath);
    return { status: 'processed', filename, outputPath };
  } catch (error) {
    throw new Error(`Image processing failed: ${error.message}`);
  }
}

// Queue processing
imageQueue.process('imageUpload', async (job) => {
  const { taskId, filename } = job.data;
  try {
    const result = await processImage(filename, job);
    return result;
  } catch (error) {
    console.error(`Error processing job ${job.id}:`, error);
    throw error;
  }
});

// Event handlers
imageQueue.on('completed', async (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
  const { taskId, filename } = job.data;
  try {
    await sequelize.transaction(async (t) => {
      // Update Document status
      const doc = await Document.findOne({
        where: { task_id: taskId, original_url: `/uploads/${filename}` },
        transaction: t,
      });
      if (doc) {
        doc.status = 'PROCESSED';
        doc.processed_url = `/uploads/processed/${filename}`; // Assuming processed_url field exists
        await doc.save({ transaction: t });
      }
      // Update Task images_processed count
      const task = await Task.findByPk(taskId, { transaction: t });
      if (task) {
        task.images_processed = (task.images_processed || 0) + 1;
        if (task.images_processed === task.images_total) {
          task.status = 'COMPLETED';
        }
        await task.save({ transaction: t });
      }
    });
  } catch (error) {
    console.error(`Failed to update database after job ${job.id}:`, error);
  }
});

imageQueue.on('failed', async (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
  const { taskId, filename } = job.data;
  try {
    await sequelize.transaction(async (t) => {
      const doc = await Document.findOne({
        where: { task_id: taskId, original_url: `/uploads/${filename}` },
        transaction: t,
      });
      if (doc) {
        doc.status = 'FAILED';
        doc.error_message = err.message;
        await doc.save({ transaction: t });
      }
    });
  } catch (error) {
    console.error(`Failed to update document status for job ${job.id}:`, error);
  }
});

imageQueue.on('stalled', (job) => {
  console.warn(`Job ${job.id} stalled`);
});

imageQueue.on('progress', (job, progress) => {
  console.log(`Job ${job.id} progress: ${progress}%`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down image queue...');
  await imageQueue.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Shutting down image queue...');
  await imageQueue.close();
  process.exit(0);
});

// Add job to queue
async function addImageProcessingJob(taskId, filename) {
  try {
    const job = await imageQueue.add('imageUpload', {
      taskId,
      filename,
    }, {
      priority: 1,
      delay: 0,
    });
    console.log(`Added job ${job.id} for task ${taskId}, file: ${filename}`);
    return job;
  } catch (error) {
    console.error('Failed to add job to queue:', error);
    // Fallback to synchronous processing
    try {
      const result = await processImage(filename, { id: 'sync' });
      // Update database for synchronous processing
      await sequelize.transaction(async (t) => {
        const doc = await Document.findOne({
          where: { task_id: taskId, original_url: `/uploads/${filename}` },
          transaction: t,
        });
        if (doc) {
          doc.status = 'PROCESSED';
          doc.processed_url = `/uploads/processed/${filename}`;
          await doc.save({ transaction: t });
        }
        const task = await Task.findByPk(taskId, { transaction: t });
        if (task) {
          task.images_processed = (task.images_processed || 0) + 1;
          if (task.images_processed === task.images_total) {
            task.status = 'COMPLETED';
          }
          await task.save({ transaction: t });
        }
      });
      return { id: 'sync', status: 'completed', result };
    } catch (syncError) {
      console.error('Synchronous image processing failed:', syncError);
      throw syncError;
    }
  }
}

module.exports = {
  imageQueue,
  addImageProcessingJob,
};

console.log('Image worker started and listening for jobs...');