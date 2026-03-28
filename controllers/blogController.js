const blogService = require('../services/blogService');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

class BlogController {
  async createBlog(req, res, next) {
    try {
      const blogData = {
        ...req.body,
        author: req.user.id
      };
      
      const blog = await blogService.createBlog(blogData);
      
      ApiResponse.success(res, blog, 'Blog created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getBlogs(req, res, next) {
    try {
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        sort: req.query.sort,
        category: req.query.category,
        author: req.query.author,
        tag: req.query.tag,
        search: req.query.search
      };
      
      const result = await blogService.getAllBlogs(options);
      
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

  async getBlogBySlug(req, res, next) {
    try {
      const blog = await blogService.getBlogBySlug(req.params.slug, req.user?.id);
      
      ApiResponse.success(res, blog, 'Blog retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getBlogById(req, res, next) {
    try {
      const blog = await blogService.getBlogById(req.params.id);
      
      ApiResponse.success(res, blog, 'Blog retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateBlog(req, res, next) {
    try {
      const blog = await blogService.updateBlog(
        req.params.id,
        req.user.id,
        req.user.role,
        req.body
      );
      
      ApiResponse.success(res, blog, 'Blog updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteBlog(req, res, next) {
    try {
      await blogService.deleteBlog(req.params.id, req.user.id, req.user.role);
      
      ApiResponse.success(res, null, 'Blog deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getBlogsByCategory(req, res, next) {
    try {
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        category: req.params.categoryId
      };
      
      const result = await blogService.getAllBlogs(options);
      
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

  async getBlogsByAuthor(req, res, next) {
    try {
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        author: req.params.authorId
      };
      
      const result = await blogService.getAllBlogs(options);
      
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

  async toggleLike(req, res, next) {
    try {
      const result = await blogService.toggleLike(req.params.id, req.user.id);
      
      ApiResponse.success(res, result, result.liked ? 'Blog liked' : 'Blog unliked');
    } catch (error) {
      next(error);
    }
  }

  async getPopularBlogs(req, res, next) {
    try {
      const limit = req.query.limit || 5;
      const blogs = await blogService.getPopularBlogs(limit);
      
      ApiResponse.success(res, blogs, 'Popular blogs retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getFeaturedBlogs(req, res, next) {
    try {
      const blogs = await blogService.getFeaturedBlogs();
      
      ApiResponse.success(res, blogs, 'Featured blogs retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getRelatedBlogs(req, res, next) {
    try {
      const limit = req.query.limit || 3;
      const blogs = await blogService.getRelatedBlogs(req.params.id, limit);
      
      ApiResponse.success(res, blogs, 'Related blogs retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getUserBlogs(req, res, next) {
    try {
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        sort: req.query.sort,
        status: req.query.status
      };
      
      const result = await blogService.getUserBlogs(req.user.id, options);
      
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
}

module.exports = new BlogController();