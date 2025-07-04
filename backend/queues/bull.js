const Queue = require('bull');
const redis = require('redis');

// Redis connection retry configuration
const RETRY_ATTEMPTS = 5;
const RETRY_DELAY = 2000; // 2 seconds

// Test Redis connection with retry
const testRedisConnection = async () => {
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  let attempts = 0;

  while (attempts < RETRY_ATTEMPTS) {
    attempts++;
    const client = redis.createClient(redisUrl);

    try {
      await client.connect();
      console.log('Redis connected successfully');
      await client.quit();
      return true;
    } catch (err) {
      console.error(`Redis connection attempt ${attempts} failed:`, err.message);
      if (attempts === RETRY_ATTEMPTS) {
        console.error('All Redis connection attempts failed. Queue functionality will be disabled.');
        return false;
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }
};

// Initialize Redis connection test
let redisAvailable = false;
testRedisConnection()
  .then((connected) => {
    redisAvailable = connected;
    if (!connected) {
      console.warn('Proceeding without queue functionality due to Redis connection failure.');
    }
  })
  .catch((err) => {
    console.error('Unexpected error during Redis connection test:', err);
    redisAvailable = false;
  });

// Create queues with consistent configuration
const queueOptions = {
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

const imageQueue = new Queue('imageUpload', process.env.REDIS_URL || 'redis://127.0.0.1:6379', queueOptions);
const emailQueue = new Queue('email', process.env.REDIS_URL || 'redis://127.0.0.1:6379', queueOptions);

// Event listeners for monitoring
imageQueue.on('ready', () => {
  console.log('Image queue is ready');
  redisAvailable = true; // Update status if connection succeeds
});

imageQueue.on('error', (error) => {
  console.error('Image queue error:', error);
  redisAvailable = false;
});

imageQueue.on('completed', (job) => {
  console.log(`Image job ${job.id} completed`);
});

imageQueue.on('failed', (job, err) => {
  console.error(`Image job ${job.id} failed: ${err.message}`);
});

imageQueue.on('stalled', (job) => {
  console.warn(`Image job ${job.id} stalled`);
});

emailQueue.on('ready', () => {
  console.log('Email queue is ready');
  redisAvailable = true;
});

emailQueue.on('error', (error) => {
  console.error('Email queue error:', error);
  redisAvailable = false;
});

emailQueue.on('completed', (job) => {
  console.log(`Email job ${job.id} completed`);
});

emailQueue.on('failed', (job, err) => {
  console.error(`Email job ${job.id} failed: ${err.message}`);
});

emailQueue.on('stalled', (job) => {
  console.warn(`Email job ${job.id} stalled`);
});

// Export redisAvailable for use in routes
module.exports = { imageQueue, emailQueue, redisAvailable };