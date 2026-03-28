const BlogCategory = require('../models/BlogCategory');
const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

class CategoryRepository {
  async create(categoryData) {
    try {
      const category = await BlogCategory.create(categoryData);
      
      // Clear cache
      const redisClient = getRedisClient();
      if (redisClient && redisClient.isReady) {
        await redisClient.del('cache:/api/categories*');
      }
      
      return category;
    } catch (error) {
      logger.error('CategoryRepository.create error:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      return await BlogCategory.findById(id);
    } catch (error) {
      logger.error('CategoryRepository.findById error:', error);
      throw error;
    }
  }

  async findBySlug(slug) {
    try {
      return await BlogCategory.findOne({ slug });
    } catch (error) {
      logger.error('CategoryRepository.findBySlug error:', error);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const category = await BlogCategory.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      
      // Clear cache
      const redisClient = getRedisClient();
      if (redisClient && redisClient.isReady) {
        await redisClient.del(`cache:/api/categories/${id}`);
        await redisClient.del(`cache:/api/categories/slug/${category.slug}`);
        await redisClient.del('cache:/api/categories*');
      }
      
      return category;
    } catch (error) {
      logger.error('CategoryRepository.update error:', error);
      throw error;
    }
  }

  async findAll(query = {}, options = {}) {
    try {
      const { page = 1, limit = 20, sort = 'name' } = options;
      const skip = (page - 1) * limit;

      const categories = await BlogCategory.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await BlogCategory.countDocuments(query);

      return {
        categories,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('CategoryRepository.findAll error:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const category = await BlogCategory.findByIdAndDelete(id);
      
      // Clear cache
      const redisClient = getRedisClient();
      if (redisClient && redisClient.isReady) {
        await redisClient.del(`cache:/api/categories/${id}`);
        await redisClient.del('cache:/api/categories*');
      }
      
      return category;
    } catch (error) {
      logger.error('CategoryRepository.delete error:', error);
      throw error;
    }
  }

  async getWithBlogCount() {
    try {
      const categories = await BlogCategory.aggregate([
        {
          $lookup: {
            from: 'blogs',
            localField: '_id',
            foreignField: 'category',
            as: 'blogs'
          }
        },
        {
          $project: {
            name: 1,
            slug: 1,
            description: 1,
            blogCount: { $size: '$blogs' }
          }
        },
        { $sort: { name: 1 } }
      ]);

      return categories;
    } catch (error) {
      logger.error('CategoryRepository.getWithBlogCount error:', error);
      throw error;
    }
  }

  async toggleActive(id) {
    try {
      const category = await BlogCategory.findById(id);
      if (!category) return null;
      
      category.isActive = !category.isActive;
      await category.save();
      
      // Clear cache
      const redisClient = getRedisClient();
      if (redisClient && redisClient.isReady) {
        await redisClient.del(`cache:/api/categories/${id}`);
        await redisClient.del('cache:/api/categories*');
      }
      
      return category;
    } catch (error) {
      logger.error('CategoryRepository.toggleActive error:', error);
      throw error;
    }
  }
}

module.exports = new CategoryRepository();