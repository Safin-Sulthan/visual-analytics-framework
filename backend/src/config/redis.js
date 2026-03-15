const { Redis } = require('ioredis');

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

if (process.env.REDIS_PASSWORD) {
  redisConfig.password = process.env.REDIS_PASSWORD;
}

const createRedisClient = () => new Redis(redisConfig);

const redisConnection = createRedisClient();

redisConnection.on('connect', () => console.info('Redis connected'));
redisConnection.on('error', (err) => console.error(`Redis error: ${err.message}`));

module.exports = { redisConnection, createRedisClient, redisConfig };
