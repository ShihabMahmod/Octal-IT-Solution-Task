const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    try {
      const redisClient = getRedisClient();
      
      if (!redisClient || !redisClient.isReady) {
        return next();
      }

      const key = `cache:${req.originalUrl}`;
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        logger.debug(`Cache hit for ${key}`);
        return res.status(200).json(JSON.parse(cachedData));
      }

      // Store original send function
      const originalSend = res.json;
      
      // Override json method
      res.json = function(data) {
        // Cache the response
        if (res.statusCode === 200) {
          redisClient.setEx(key, duration, JSON.stringify(data))
            .catch(err => logger.error('Redis cache set error:', err));
        }
        
        // Call original send
        originalSend.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

const clearCache = (pattern) => {
  return async (req, res, next) => {
    try {
      const redisClient = getRedisClient();
      
      if (redisClient && redisClient.isReady) {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(keys);
          logger.debug(`Cleared cache for pattern: ${pattern}`);
        }
      }
      
      next();
    } catch (error) {
      logger.error('Clear cache error:', error);
      next();
    }
  };
};

module.exports = { cacheMiddleware, clearCache };