const categoryRepository = require('../repositories/categoryRepository');
const cacheService = require('./cacheService');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

class CategoryService {
  async createCategory(categoryData) {
    try {
      // Check if category with same name exists
      const existingCategory = await categoryRepository.findByName(categoryData.name);
      if (existingCategory) {
        throw new ApiError(400, 'Category with this name already exists');
      }

      const category = await categoryRepository.create(categoryData);
      
      // Clear cache
      await cacheService.delPattern('cache:/api/categories*');
      
      return category;
    } catch (error) {
      logger.error('CategoryService.createCategory error:', error);
      throw error;
    }
  }

  async getAllCategories(options = {}, adminView = false) {
    try {
      const cacheKey = `cache:/api/categories?${JSON.stringify(options)}`;
      
      return await cacheService.getOrSet(cacheKey, async () => {
        const filter = {};
        
        // If not admin view, only show active categories
        if (!adminView) {
          filter.isActive = true;
        }
        
        return await categoryRepository.findAll(filter, options);
      });
    } catch (error) {
      logger.error('CategoryService.getAllCategories error:', error);
      throw error;
    }
  }

  async getCategoryById(id) {
    try {
      const cacheKey = `cache:/api/categories/${id}`;
      
      return await cacheService.getOrSet(cacheKey, async () => {
        const category = await categoryRepository.findById(id);
        
        if (!category) {
          throw new ApiError(404, 'Category not found');
        }
        
        return category;
      });
    } catch (error) {
      logger.error('CategoryService.getCategoryById error:', error);
      throw error;
    }
  }

  async getCategoryBySlug(slug) {
    try {
      const cacheKey = `cache:/api/categories/slug/${slug}`;
      
      return await cacheService.getOrSet(cacheKey, async () => {
        const category = await categoryRepository.findBySlug(slug);
        
        if (!category) {
          throw new ApiError(404, 'Category not found');
        }
        
        return category;
      });
    } catch (error) {
      logger.error('CategoryService.getCategoryBySlug error:', error);
      throw error;
    }
  }

  async updateCategory(id, updateData) {
    try {
      const category = await categoryRepository.findById(id);
      
      if (!category) {
        throw new ApiError(404, 'Category not found');
      }
      
      // If name is being updated, check for uniqueness
      if (updateData.name && updateData.name !== category.name) {
        const existingCategory = await categoryRepository.findByName(updateData.name);
        if (existingCategory) {
          throw new ApiError(400, 'Category with this name already exists');
        }
      }
      
      const updatedCategory = await categoryRepository.update(id, updateData);
      
      // Clear cache
      await cacheService.delPattern('cache:/api/categories*');
      
      return updatedCategory;
    } catch (error) {
      logger.error('CategoryService.updateCategory error:', error);
      throw error;
    }
  }

  async deleteCategory(id) {
    try {
      const category = await categoryRepository.findById(id);
      
      if (!category) {
        throw new ApiError(404, 'Category not found');
      }
      
      // Check if category has blogs (optional - can be implemented)
      // const blogCount = await blogRepository.countByCategory(id);
      // if (blogCount > 0) {
      //   throw new ApiError(400, 'Cannot delete category with existing blogs');
      // }
      
      await categoryRepository.delete(id);
      
      // Clear cache
      await cacheService.delPattern('cache:/api/categories*');
    } catch (error) {
      logger.error('CategoryService.deleteCategory error:', error);
      throw error;
    }
  }

  async getCategoriesWithCount() {
    try {
      const cacheKey = 'cache:/api/categories/with-count';
      
      return await cacheService.getOrSet(cacheKey, async () => {
        return await categoryRepository.getWithBlogCount();
      }, 600); // Cache for 10 minutes
    } catch (error) {
      logger.error('CategoryService.getCategoriesWithCount error:', error);
      throw error;
    }
  }

  async toggleActive(id) {
    try {
      const category = await categoryRepository.toggleActive(id);
      
      if (!category) {
        throw new ApiError(404, 'Category not found');
      }
      
      // Clear cache
      await cacheService.delPattern('cache:/api/categories*');
      
      return category;
    } catch (error) {
      logger.error('CategoryService.toggleActive error:', error);
      throw error;
    }
  }
}

module.exports = new CategoryService();