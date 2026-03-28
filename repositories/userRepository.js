const User = require('../models/User');
const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

class UserRepository {
  async create(userData) {
    try {
      const user = await User.create(userData);
      return user;
    } catch (error) {
      logger.error('UserRepository.create error:', error);
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      return await User.findOne({ email }).select('+password');
    } catch (error) {
      logger.error('UserRepository.findByEmail error:', error);
      throw error;
    }
  }

  async findById(id, includePassword = false) {
    try {
      const query = User.findById(id);
      if (includePassword) {
        query.select('+password');
      }
      return await query;
    } catch (error) {
      logger.error('UserRepository.findById error:', error);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      
      // Clear cache
      const redisClient = getRedisClient();
      if (redisClient && redisClient.isReady) {
        await redisClient.del(`cache:/api/users/${id}`);
      }
      
      return user;
    } catch (error) {
      logger.error('UserRepository.update error:', error);
      throw error;
    }
  }

  async findAll(query = {}, options = {}) {
    try {
      const { page = 1, limit = 10, sort = '-createdAt' } = options;
      const skip = (page - 1) * limit;

      const users = await User.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments(query);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('UserRepository.findAll error:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const user = await User.findByIdAndDelete(id);
      
      // Clear cache
      const redisClient = getRedisClient();
      if (redisClient && redisClient.isReady) {
        await redisClient.del(`cache:/api/users/${id}`);
      }
      
      return user;
    } catch (error) {
      logger.error('UserRepository.delete error:', error);
      throw error;
    }
  }

  async updateLastLogin(id) {
    try {
      return await User.findByIdAndUpdate(id, {
        lastLogin: new Date()
      });
    } catch (error) {
      logger.error('UserRepository.updateLastLogin error:', error);
      throw error;
    }
  }

  async toggleActive(id) {
    try {
      const user = await User.findById(id);
      if (!user) return null;
      
      user.isActive = !user.isActive;
      await user.save();
      
      // Clear cache
      const redisClient = getRedisClient();
      if (redisClient && redisClient.isReady) {
        await redisClient.del(`cache:/api/users/${id}`);
        await redisClient.del('cache:/api/admin/users*');
      }
      
      return user;
    } catch (error) {
      logger.error('UserRepository.toggleActive error:', error);
      throw error;
    }
  }
}

module.exports = new UserRepository();