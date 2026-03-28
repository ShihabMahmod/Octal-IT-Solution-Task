const commentService = require('../services/commentService');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

class CommentController {
  async addComment(req, res, next) {
    try {
      const commentData = {
        ...req.body,
        blog: req.params.blogId,
        author: req.user.id
      };
      
      const comment = await commentService.addComment(commentData);
      
      ApiResponse.success(res, comment, 'Comment added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getBlogComments(req, res, next) {
    try {
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        sort: req.query.sort
      };
      
      const result = await commentService.getBlogComments(
        req.params.blogId,
        options
      );
      
      ApiResponse.paginated(
        res,
        result.comments,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total,
        'Comments retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req, res, next) {
    try {
      const comment = await commentService.updateComment(
        req.params.id,
        req.user.id,
        req.user.role,
        req.body.content
      );
      
      ApiResponse.success(res, comment, 'Comment updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req, res, next) {
    try {
      await commentService.deleteComment(
        req.params.id,
        req.user.id,
        req.user.role
      );
      
      ApiResponse.success(res, null, 'Comment deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async toggleLike(req, res, next) {
    try {
      const result = await commentService.toggleLike(req.params.id, req.user.id);
      
      ApiResponse.success(res, result, result.liked ? 'Comment liked' : 'Comment unliked');
    } catch (error) {
      next(error);
    }
  }

  async replyToComment(req, res, next) {
    try {
      const replyData = {
        content: req.body.content,
        blog: req.params.blogId,
        author: req.user.id,
        parentComment: req.params.commentId
      };
      
      const reply = await commentService.addComment(replyData);
      
      ApiResponse.success(res, reply, 'Reply added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getUserComments(req, res, next) {
    try {
      const options = {
        page: req.query.page,
        limit: req.query.limit
      };
      
      const result = await commentService.getUserComments(req.user.id, options);
      
      ApiResponse.paginated(
        res,
        result.comments,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total,
        'User comments retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommentController();