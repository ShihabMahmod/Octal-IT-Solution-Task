const Blog = require('../models/Blog');
const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

class BlogRepository {
  async create(blogData) {
    try {
      const blog = await Blog.create(blogData);
      return blog;
    } catch (error) {
      logger.error('BlogRepository.create error:', error);
      throw error;
    }
  }

  async findById(id, populate = true) {
    try {
      let query = Blog.findById(id);
      
      if (populate) {
        query = query
          .populate('author', 'name email profilePicture')
          .populate('category', 'name slug');
      }
      
      return await query;
    } catch (error) {
      logger.error('BlogRepository.findById error:', error);
      throw error;
    }
  }

  async findBySlug(slug) {
    try {
      return await Blog.findOne({ slug })
        .populate('author', 'name email profilePicture')
        .populate('category', 'name slug');
    } catch (error) {
      logger.error('BlogRepository.findBySlug error:', error);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const blog = await Blog.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      
      // Clear cache
      const redisClient = getRedisClient();
      if (redisClient && redisClient.isReady) {
        await redisClient.del(`cache:/api/blogs/${id}`);
        await redisClient.del(`cache:/api/blogs/slug/${blog.slug}`);
        await redisClient.del('cache:/api/blogs*');
      }
      
      return blog;
    } catch (error) {
      logger.error('BlogRepository.update error:', error);
      throw error;
    }
  }

  async findAll(query = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sort = '-createdAt',
        status = 'published',
        category,
        author,
        tag,
        search
      } = options;

      const skip = (page - 1) * limit;

      // Build filter
      const filter = { ...query };
      
      if (status) filter.status = status;
      if (category) filter.category = category;
      if (author) filter.author = author;
      if (tag) filter.tags = tag;
      
      if (search) {
        filter.$text = { $search: search };
      }

      const blogs = await Blog.find(filter)
        .populate('author', 'name email profilePicture')
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await Blog.countDocuments(filter);

      return {
        blogs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('BlogRepository.findAll error:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const blog = await Blog.findByIdAndDelete(id);
      
      // Clear cache
      const redisClient = getRedisClient();
      if (redisClient && redisClient.isReady) {
        await redisClient.del(`cache:/api/blogs/${id}`);
        await redisClient.del('cache:/api/blogs*');
      }
      
      return blog;
    } catch (error) {
      logger.error('BlogRepository.delete error:', error);
      throw error;
    }
  }

  async incrementViews(id) {
    try {
      return await Blog.findByIdAndUpdate(id, {
        $inc: { views: 1 }
      });
    } catch (error) {
      logger.error('BlogRepository.incrementViews error:', error);
      throw error;
    }
  }

  async findRelated(blogId, categoryId, limit = 3) {
    try {
      return await Blog.find({
        _id: { $ne: blogId },
        category: categoryId,
        status: 'published'
      })
        .populate('author', 'name profilePicture')
        .populate('category', 'name slug')
        .limit(limit)
        .sort('-createdAt');
    } catch (error) {
      logger.error('BlogRepository.findRelated error:', error);
      throw error;
    }
  }

  async getPopular(limit = 5) {
    try {
      return await Blog.find({ status: 'published' })
        .sort('-views -likesCount')
        .limit(limit)
        .populate('author', 'name profilePicture');
    } catch (error) {
      logger.error('BlogRepository.getPopular error:', error);
      throw error;
    }
  }

  async getFeatured() {
    try {
      return await Blog.find({ 
        status: 'published',
        isFeatured: true 
      })
        .populate('author', 'name profilePicture')
        .populate('category', 'name slug')
        .sort('-createdAt')
        .limit(5);
    } catch (error) {
      logger.error('BlogRepository.getFeatured error:', error);
      throw error;
    }
  }
}

module.exports = new BlogRepository();