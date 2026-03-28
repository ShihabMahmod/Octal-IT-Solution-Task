const userService = require('../services/userService');
const ApiResponse = require('../utils/apiResponse');

class UserController {
  async getProfile(req, res, next) {
    try {
      const user = await userService.getUserById(req.user.id);
      
      ApiResponse.success(res, user, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const allowedFields = ['name', 'bio', 'profilePicture'];
      const updateData = {};
      
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });
      
      const user = await userService.updateUser(req.user.id, updateData);
      
      ApiResponse.success(res, user, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      
      ApiResponse.success(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getUserBlogs(req, res, next) {
    try {
      const options = {
        page: req.query.page,
        limit: req.query.limit
      };
      
      const result = await userService.getUserBlogs(req.params.id, options);
      
      ApiResponse.paginated(
        res,
        result.blogs,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total,
        'User blogs retrieved successfully'
      );
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
      
      const result = await userService.getUserComments(req.params.id, options);
      
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

  async deactivateAccount(req, res, next) {
    try {
      await userService.deactivateUser(req.user.id);
      
      ApiResponse.success(res, null, 'Account deactivated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();