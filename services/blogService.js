const blogRepository = require('../repositories/blogRepository');
const categoryRepository = require('../repositories/categoryRepository');
const likeRepository = require('../repositories/likeRepository');
const cacheService = require('./cacheService');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

class BlogService {
  async createBlog(blogData) {
    try {
      // Check if category exists
      const category = await categoryRepository.findById(blogData.category);
      if (!category) {
        throw new ApiError(404, 'Category not found');
      }

      const blog = await blogRepository.create(blogData);
      
      // Clear cache
      await cacheService.invalidateBlogCache();
      
      return blog;
    } catch (error) {
      logger.error('BlogService.createBlog error:', error);
      throw error;
    }
  }

  async getAllBlogs(options = {}, adminView = false) {
    try {
      const cacheKey = `cache:/api/blogs?${JSON.stringify(options)}`;
      
      return await cacheService.getOrSet(cacheKey, async () => {
        const filter = {};
        
        // If not admin view, only show published blogs
        if (!adminView) {
          filter.status = 'published';
        }
        
        return await blogRepository.findAll(filter, options);
      });
    } catch (error) {
      logger.error('BlogService.getAllBlogs error:', error);
      throw error;
    }
  }

  async getBlogById(id) {
    try {
      const cacheKey = `cache:/api/blogs/${id}`;
      
      const blog = await cacheService.getOrSet(cacheKey, async () => {
        const blog = await blogRepository.findById(id);
        
        if (!blog) {
          throw new ApiError(404, 'Blog not found');
        }
        
        return blog;
      });
      
      // Increment views asynchronously
      blogRepository.incrementViews(id).catch(err => 
        logger.error('Failed to increment views:', err)
      );
      
      return blog;
    } catch (error) {
      logger.error('BlogService.getBlogById error:', error);
      throw error;
    }
  }

  async getBlogBySlug(slug, userId = null) {
    try {
      const cacheKey = `cache:/api/blogs/slug/${slug}`;
      
      const blog = await cacheService.getOrSet(cacheKey, async () => {
        const blog = await blogRepository.findBySlug(slug);
        
        if (!blog) {
          throw new ApiError(404, 'Blog not found');
        }
        
        return blog;
      });
      
      // Check if user liked this blog
      if (userId) {
        const liked = await likeRepository.checkUserLike(userId, blog._id, 'blog');
        blog._doc.isLiked = !!liked;
      }
      
      // Increment views asynchronously
      blogRepository.incrementViews(blog._id).catch(err => 
        logger.error('Failed to increment views:', err)
      );
      
      return blog;
    } catch (error) {
      logger.error('BlogService.getBlogBySlug error:', error);
      throw error;
    }
  }

  async updateBlog(blogId, userId, userRole, updateData) {
    try {
      const blog = await blogRepository.findById(blogId, false);
      
      if (!blog) {
        throw new ApiError(404, 'Blog not found');
      }
      
      // Check permission (author or admin)
      if (blog.author.toString() !== userId && userRole !== 'admin') {
        throw new ApiError(403, 'You do not have permission to update this blog');
      }
      
      // Remove fields that shouldn't be updated directly
      delete updateData.author;
      delete updateData.views;
      delete updateData.likesCount;
      delete updateData.commentsCount;
      
      const updatedBlog = await blogRepository.update(blogId, updateData);
      
      // Clear cache
      await cacheService.invalidateBlogCache(blogId);
      
      return updatedBlog;
    } catch (error) {
      logger.error('BlogService.updateBlog error:', error);
      throw error;
    }
  }

  async deleteBlog(blogId, userId, userRole) {
    try {
      const blog = await blogRepository.findById(blogId, false);
      
      if (!blog) {
        throw new ApiError(404, 'Blog not found');
      }
      
      // Check permission (author or admin)
      if (blog.author.toString() !== userId && userRole !== 'admin') {
        throw new ApiError(403, 'You do not have permission to delete this blog');
      }
      
      await blogRepository.delete(blogId);
      
      // Clear cache
      await cacheService.invalidateBlogCache(blogId);
    } catch (error) {
      logger.error('BlogService.deleteBlog error:', error);
      throw error;
    }
  }

  async toggleLike(blogId, userId) {
    try {
      const blog = await blogRepository.findById(blogId, false);
      
      if (!blog) {
        throw new ApiError(404, 'Blog not found');
      }
      
      const result = await likeRepository.toggleLike(userId, blogId, 'blog');
      
      // Clear cache
      await cacheService.invalidateBlogCache(blogId);
      
      return result;
    } catch (error) {
      logger.error('BlogService.toggleLike error:', error);
      throw error;
    }
  }

  async getPopularBlogs(limit = 5) {
    try {
      const cacheKey = `cache:/api/blogs/popular?limit=${limit}`;
      
      return await cacheService.getOrSet(cacheKey, async () => {
        return await blogRepository.getPopular(limit);
      }, 600); // Cache for 10 minutes
    } catch (error) {
      logger.error('BlogService.getPopularBlogs error:', error);
      throw error;
    }
  }

  async getFeaturedBlogs() {
    try {
      const cacheKey = 'cache:/api/blogs/featured';
      
      return await cacheService.getOrSet(cacheKey, async () => {
        return await blogRepository.getFeatured();
      }, 300);
    } catch (error) {
      logger.error('BlogService.getFeaturedBlogs error:', error);
      throw error;
    }
  }

  async getRelatedBlogs(blogId, limit = 3) {
    try {
      const blog = await blogRepository.findById(blogId, false);
      
      if (!blog) {
        throw new ApiError(404, 'Blog not found');
      }
      
      const cacheKey = `cache:/api/blogs/${blogId}/related?limit=${limit}`;
      
      return await cacheService.getOrSet(cacheKey, async () => {
        return await blogRepository.findRelated(blogId, blog.category, limit);
      }, 300);
    } catch (error) {
      logger.error('BlogService.getRelatedBlogs error:', error);
      throw error;
    }
  }

  async getUserBlogs(userId, options = {}) {
    try {
      const cacheKey = `cache:/api/users/${userId}/blogs?${JSON.stringify(options)}`;
      
      return await cacheService.getOrSet(cacheKey, async () => {
        return await blogRepository.findAll(
          { author: userId },
          { ...options, status: undefined }
        );
      });
    } catch (error) {
      logger.error('BlogService.getUserBlogs error:', error);
      throw error;
    }
  }

  async updateBlogStatus(blogId, status) {
    try {
      const blog = await blogRepository.update(blogId, { status });
      
      if (!blog) {
        throw new ApiError(404, 'Blog not found');
      }
      
      // Clear cache
      await cacheService.invalidateBlogCache(blogId);
      
      return blog;
    } catch (error) {
      logger.error('BlogService.updateBlogStatus error:', error);
      throw error;
    }
  }

  async toggleFeatured(blogId) {
    try {
      const blog = await blogRepository.findById(blogId, false);
      
      if (!blog) {
        throw new ApiError(404, 'Blog not found');
      }
      
      blog.isFeatured = !blog.isFeatured;
      await blog.save();
      
      // Clear cache
      await cacheService.invalidateBlogCache(blogId);
      
      return blog;
    } catch (error) {
      logger.error('BlogService.toggleFeatured error:', error);
      throw error;
    }
  }
}

module.exports = new BlogService();