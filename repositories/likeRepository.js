const Like = require('../models/Like');
const logger = require('../utils/logger');

class LikeRepository {
  async create(likeData) {
    try {
      const like = await Like.create(likeData);
      return like;
    } catch (error) {
      logger.error('LikeRepository.create error:', error);
      throw error;
    }
  }

  async findByUserAndTarget(userId, targetId, type) {
    try {
      const query = type === 'blog' 
        ? { user: userId, blog: targetId, type: 'blog' }
        : { user: userId, comment: targetId, type: 'comment' };
      
      return await Like.findOne(query);
    } catch (error) {
      logger.error('LikeRepository.findByUserAndTarget error:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const like = await Like.findByIdAndDelete(id);
      return like;
    } catch (error) {
      logger.error('LikeRepository.delete error:', error);
      throw error;
    }
  }

  async toggleLike(userId, targetId, type) {
    try {
      // চেক করা লাইক already আছে কিনা
      const existingLike = await this.findByUserAndTarget(userId, targetId, type);
      
      if (existingLike) {
        // লাইক remove করা
        await this.delete(existingLike._id);
        return { liked: false, like: null };
      } else {
        // নতুন লাইক create করা
        const likeData = type === 'blog'
          ? { user: userId, blog: targetId, type: 'blog' }
          : { user: userId, comment: targetId, type: 'comment' };
        
        const newLike = await this.create(likeData);
        return { liked: true, like: newLike };
      }
    } catch (error) {
      logger.error('LikeRepository.toggleLike error:', error);
      throw error;
    }
  }

  async countByBlog(blogId) {
    try {
      return await Like.countDocuments({ blog: blogId, type: 'blog' });
    } catch (error) {
      logger.error('LikeRepository.countByBlog error:', error);
      throw error;
    }
  }

  async countByComment(commentId) {
    try {
      return await Like.countDocuments({ comment: commentId, type: 'comment' });
    } catch (error) {
      logger.error('LikeRepository.countByComment error:', error);
      throw error;
    }
  }

  async checkUserLike(userId, targetId, type) {
    try {
      const like = await this.findByUserAndTarget(userId, targetId, type);
      return !!like;
    } catch (error) {
      logger.error('LikeRepository.checkUserLike error:', error);
      throw error;
    }
  }

  async deleteByBlog(blogId) {
    try {
      await Like.deleteMany({ blog: blogId, type: 'blog' });
    } catch (error) {
      logger.error('LikeRepository.deleteByBlog error:', error);
      throw error;
    }
  }

  async deleteByComment(commentId) {
    try {
      await Like.deleteMany({ comment: commentId, type: 'comment' });
    } catch (error) {
      logger.error('LikeRepository.deleteByComment error:', error);
      throw error;
    }
  }
}

module.exports = new LikeRepository();