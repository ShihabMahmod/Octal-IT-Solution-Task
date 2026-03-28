const Comment = require('../models/Comment');
const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

class CommentRepository {
  async create(commentData) {
    try {
      const comment = await Comment.create(commentData);
      
      // Clear cache
      const redisClient = getRedisClient();
      if (redisClient && redisClient.isReady) {
        await redisClient.del(`cache:/api/blogs/${comment.blog}/comments*`);
        await redisClient.del('cache:/api/comments*');
      }
      
      return comment;
    } catch (error) {
      logger.error('CommentRepository.create error:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      return await Comment.findById(id)
        .populate('author', 'name email profilePicture')
        .populate('replies');
    } catch (error) {
      logger.error('CommentRepository.findById error:', error);
      throw error;
    }
  }

  async findByBlog(blogId, options = {}) {
    try {
      const { page = 1, limit = 20, sort = '-createdAt' } = options;
      const skip = (page - 1) * limit;

      const comments = await Comment.find({ 
        blog: blogId,
        parentComment: null 
      })
        .populate('author', 'name email profilePicture')
        .populate({
          path: 'replies',
          populate: {
            path: 'author',
            select: 'name email profilePicture'
          }
        })
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await Comment.countDocuments({ 
        blog: blogId,
        parentComment: null 
      });

      return {
        comments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('CommentRepository.findByBlog error:', error);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const comment = await Comment.findByIdAndUpdate(
        id,
        { ...updateData, isEdited: true, editedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      // Clear cache
      const redisClient = getRedisClient();
      if (redisClient && redisClient.isReady) {
        await redisClient.del(`cache:/api/comments/${id}`);
        await redisClient.del(`cache:/api/blogs/${comment.blog}/comments*`);
      }
      
      return comment;
    } catch (error) {
      logger.error('CommentRepository.update error:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const comment = await Comment.findById(id);
      
      if (comment) {
        // Delete all replies
        if (comment.replies && comment.replies.length > 0) {
          await Comment.deleteMany({ _id: { $in: comment.replies } });
        }
        
        await comment.remove();
        
        // Clear cache
        const redisClient = getRedisClient();
        if (redisClient && redisClient.isReady) {
          await redisClient.del(`cache:/api/comments/${id}`);
          await redisClient.del(`cache:/api/blogs/${comment.blog}/comments*`);
        }
      }
      
      return comment;
    } catch (error) {
      logger.error('CommentRepository.delete error:', error);
      throw error;
    }
  }

  async toggleApproval(id) {
    try {
      const comment = await Comment.findById(id);
      if (!comment) return null;
      
      comment.isApproved = !comment.isApproved;
      await comment.save();
      
      // Clear cache
      const redisClient = getRedisClient();
      if (redisClient && redisClient.isReady) {
        await redisClient.del(`cache:/api/comments/${id}`);
        await redisClient.del(`cache:/api/blogs/${comment.blog}/comments*`);
      }
      
      return comment;
    } catch (error) {
      logger.error('CommentRepository.toggleApproval error:', error);
      throw error;
    }
  }

  async getUserComments(userId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      const comments = await Comment.find({ author: userId })
        .populate('blog', 'title slug')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit);

      const total = await Comment.countDocuments({ author: userId });

      return {
        comments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('CommentRepository.getUserComments error:', error);
      throw error;
    }
  }
}

module.exports = new CommentRepository();