const userService = require('../services/userService');
const blogService = require('../services/blogService');
const categoryService = require('../services/categoryService');
const commentService = require('../services/commentService');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

class AdminController {
  // User Management
  async getAllUsers(req, res, next) {
    try {
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        sort: req.query.sort,
        role: req.query.role,
        isActive: req.query.isActive
      };
      
      const result = await userService.getAllUsers(options);
      
      ApiResponse.paginated(
        res,
        result.users,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total,
        'Users retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  async getUserDetails(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id, true);
      
      ApiResponse.success(res, user, 'User details retrieved');
    } catch (error) {
      next(error);
    }
  }

  async toggleUserStatus(req, res, next) {
    try {
      const user = await userService.toggleUserStatus(req.params.id);
      
      ApiResponse.success(
        res,
        user,
        `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
      );
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req, res, next) {
    try {
      const { role } = req.body;
      const user = await userService.updateUserRole(req.params.id, role);
      
      ApiResponse.success(res, user, 'User role updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // Blog Management
  async getAllBlogs(req, res, next) {
    try {
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        sort: req.query.sort,
        status: req.query.status,
        category: req.query.category,
        author: req.query.author
      };
      
      const result = await blogService.getAllBlogs(options, true);
      
      ApiResponse.paginated(
        res,
        result.blogs,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total,
        'Blogs retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  async updateBlogStatus(req, res, next) {
    try {
      const { status } = req.body;
      const blog = await blogService.updateBlogStatus(req.params.id, status);
      
      ApiResponse.success(res, blog, 'Blog status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async toggleFeatured(req, res, next) {
    try {
      const blog = await blogService.toggleFeatured(req.params.id);
      
      ApiResponse.success(
        res,
        blog,
        `Blog ${blog.isFeatured ? 'featured' : 'unfeatured'} successfully`
      );
    } catch (error) {
      next(error);
    }
  }

  // Category Management
  async getAllCategories(req, res, next) {
    try {
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        sort: req.query.sort,
        isActive: req.query.isActive
      };
      
      const result = await categoryService.getAllCategories(options, true);
      
      ApiResponse.paginated(
        res,
        result.categories,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total,
        'Categories retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  // Comment Management
  async getAllComments(req, res, next) {
    try {
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        sort: req.query.sort,
        blogId: req.query.blogId,
        userId: req.query.userId,
        isApproved: req.query.isApproved
      };
      
      const result = await commentService.getAllComments(options);
      
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

  async approveComment(req, res, next) {
    try {
      const comment = await commentService.approveComment(req.params.id);
      
      ApiResponse.success(res, comment, 'Comment approved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Dashboard Stats
  async getDashboardStats(req, res, next) {
    try {
      const stats = await userService.getDashboardStats();
      
      ApiResponse.success(res, stats, 'Dashboard statistics retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();