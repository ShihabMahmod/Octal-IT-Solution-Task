const userRepository = require('../repositories/userRepository');
const blogRepository = require('../repositories/blogRepository');
const commentRepository = require('../repositories/commentRepository');
const cacheService = require('./cacheService');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

class UserService {
  async getUserById(id, includeSensitive = false) {
    try {
      const cacheKey = `cache:/api/users/${id}`;
      
      return await cacheService.getOrSet(cacheKey, async () => {
        const user = await userRepository.findById(id, includeSensitive);
        
        if (!user) {
          throw new ApiError(404, 'User not found');
        }
        
        return user;
      });
    } catch (error) {
      logger.error('UserService.getUserById error:', error);
      throw error;
    }
  }

  async updateUser(id, updateData) {
    try {
      const user = await userRepository.findById(id);
      
      if (!user) {
        throw new ApiError(404, 'User not found');
      }
      
      const updatedUser = await userRepository.update(id, updateData);
      
      // Clear cache
      await cacheService.invalidateUserCache(id);
      
      return updatedUser;
    } catch (error) {
      logger.error('UserService.updateUser error:', error);
      throw error;
    }
  }

  async getUserBlogs(userId, options = {}) {
    try {
      return await blogRepository.findAll(
        { author: userId, status: 'published' },
        options
      );
    } catch (error) {
      logger.error('UserService.getUserBlogs error:', error);
      throw error;
    }
  }

  async getUserComments(userId, options = {}) {
    try {
      return await commentRepository.getUserComments(userId, options);
    } catch (error) {
      logger.error('UserService.getUserComments error:', error);
      throw error;
    }
  }

  async deactivateUser(userId) {
    try {
      const user = await userRepository.update(userId, { isActive: false });
      
      if (!user) {
        throw new ApiError(404, 'User not found');
      }
      
      // Clear cache
      await cacheService.invalidateUserCache(userId);
      
      return user;
    } catch (error) {
      logger.error('UserService.deactivateUser error:', error);
      throw error;
    }
  }

  // Admin methods
  async getAllUsers(options = {}) {
    try {
      const cacheKey = `cache:/api/admin/users?${JSON.stringify(options)}`;
      
      return await cacheService.getOrSet(cacheKey, async () => {
        const filter = {};
        
        if (options.role) {
          filter.role = options.role;
        }
        
        if (options.isActive !== undefined) {
          filter.isActive = options.isActive === 'true';
        }
        
        return await userRepository.findAll(filter, options);
      });
    } catch (error) {
      logger.error('UserService.getAllUsers error:', error);
      throw error;
    }
  }

  async toggleUserStatus(userId) {
    try {
      const user = await userRepository.toggleActive(userId);
      
      if (!user) {
        throw new ApiError(404, 'User not found');
      }
      
      // Clear cache
      await cacheService.invalidateUserCache(userId);
      
      return user;
    } catch (error) {
      logger.error('UserService.toggleUserStatus error:', error);
      throw error;
    }
  }

  async updateUserRole(userId, role) {
    try {
      const user = await userRepository.update(userId, { role });
      
      if (!user) {
        throw new ApiError(404, 'User not found');
      }
      
      // Clear cache
      await cacheService.invalidateUserCache(userId);
      
      return user;
    } catch (error) {
      logger.error('UserService.updateUserRole error:', error);
      throw error;
    }
  }

  async getDashboardStats() {
    try {
      const cacheKey = 'cache:/api/admin/dashboard/stats';
      
      return await cacheService.getOrSet(cacheKey, async () => {
        const [
          totalUsers,
          totalBlogs,
          totalPublishedBlogs,
          totalComments,
          totalCategories,
          recentUsers,
          popularBlogs
        ] = await Promise.all([
          userRepository.countDocuments({}),
          blogRepository.countDocuments({}),
          blogRepository.countDocuments({ status: 'published' }),
          commentRepository.countDocuments({}),
          categoryRepository.countDocuments({}),
          userRepository.findAll({}, { limit: 5, sort: '-createdAt' }),
          blogRepository.getPopular(5)
        ]);

        return {
          totalUsers,
          totalBlogs,
          totalPublishedBlogs,
          totalComments,
          totalCategories,
          recentUsers: recentUsers.users,
          popularBlogs
        };
      }, 600); // Cache for 10 minutes
    } catch (error) {
      logger.error('UserService.getDashboardStats error:', error);
      throw error;
    }
  }
}

module.exports = new UserService();