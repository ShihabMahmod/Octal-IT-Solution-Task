const categoryService = require('../services/categoryService');
const ApiResponse = require('../utils/apiResponse');

class CategoryController {
  async createCategory(req, res, next) {
    try {
      const categoryData = {
        ...req.body,
        createdBy: req.user.id
      };
      
      const category = await categoryService.createCategory(categoryData);
      
      ApiResponse.success(res, category, 'Category created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req, res, next) {
    try {
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        sort: req.query.sort
      };
      
      const result = await categoryService.getAllCategories(options);
      
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

  async getCategoryById(req, res, next) {
    try {
      const category = await categoryService.getCategoryById(req.params.id);
      
      ApiResponse.success(res, category, 'Category retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getCategoryBySlug(req, res, next) {
    try {
      const category = await categoryService.getCategoryBySlug(req.params.slug);
      
      ApiResponse.success(res, category, 'Category retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const category = await categoryService.updateCategory(
        req.params.id,
        req.body
      );
      
      ApiResponse.success(res, category, 'Category updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      await categoryService.deleteCategory(req.params.id);
      
      ApiResponse.success(res, null, 'Category deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getCategoriesWithCount(req, res, next) {
    try {
      const categories = await categoryService.getCategoriesWithCount();
      
      ApiResponse.success(res, categories, 'Categories retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async toggleActive(req, res, next) {
    try {
      const category = await categoryService.toggleActive(req.params.id);
      
      ApiResponse.success(
        res,
        category,
        `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();