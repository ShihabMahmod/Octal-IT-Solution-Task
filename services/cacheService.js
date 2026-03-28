const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.client = getRedisClient();
    this.defaultTTL = 300; // 5 minutes
  }

  async get(key) {
    try {
      if (!this.client || !this.client.isReady) return null;
      
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('CacheService.get error:', error);
      return null;
    }
  }

  async set(key, data, ttl = this.defaultTTL) {
    try {
      if (!this.client || !this.client.isReady) return false;
      
      await this.client.setEx(key, ttl, JSON.stringify(data));
      return true;
    } catch (error) {
      logger.error('CacheService.set error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      if (!this.client || !this.client.isReady) return false;
      
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('CacheService.del error:', error);
      return false;
    }
  }

  async delPattern(pattern) {
    try {
      if (!this.client || !this.client.isReady) return false;
      
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      logger.error('CacheService.delPattern error:', error);
      return false;
    }
  }

  async getOrSet(key, fetchFunction, ttl = this.defaultTTL) {
    try {
      // Try to get from cache
      const cached = await this.get(key);
      if (cached) return cached;

      // If not in cache, fetch data
      const data = await fetchFunction();
      
      // Store in cache
      await this.set(key, data, ttl);
      
      return data;
    } catch (error) {
      logger.error('CacheService.getOrSet error:', error);
      // If cache fails, just return the fetched data
      return await fetchFunction();
    }
  }

  async invalidateBlogCache(blogId = null) {
    try {
      if (blogId) {
        await this.delPattern(`cache:/api/blogs/${blogId}*`);
      }
      await this.delPattern('cache:/api/blogs*');
      await this.delPattern('cache:/api/categories*');
    } catch (error) {
      logger.error('CacheService.invalidateBlogCache error:', error);
    }
  }

  async invalidateUserCache(userId) {
    try {
      await this.delPattern(`cache:/api/users/${userId}*`);
      await this.delPattern('cache:/api/admin/users*');
    } catch (error) {
      logger.error('CacheService.invalidateUserCache error:', error);
    }
  }
}

module.exports = new CacheService();