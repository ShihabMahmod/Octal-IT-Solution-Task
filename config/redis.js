const redis = require('redis');
const logger = require('../utils/logger');

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis Connected Successfully');
    });

    await redisClient.connect();
  } catch (error) {
    logger.error('Redis connection error:', error);
  }
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };