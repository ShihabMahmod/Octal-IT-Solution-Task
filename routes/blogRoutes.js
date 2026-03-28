const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const commentController = require('../controllers/commentController');
const { protect, restrictTo } = require('../middlewares/auth');
const { cacheMiddleware } = require('../middlewares/cache');
const validate = require('../middlewares/validation');
const { 
  createBlogValidation, 
  updateBlogValidation,
  createCommentValidation 
} = require('../validations/blogValidation');

// Public routes
router.get('/', cacheMiddleware(300), blogController.getBlogs);
router.get('/popular', cacheMiddleware(600), blogController.getPopularBlogs);
router.get('/featured', cacheMiddleware(300), blogController.getFeaturedBlogs);
router.get('/slug/:slug', cacheMiddleware(300), blogController.getBlogBySlug);
router.get('/:id', cacheMiddleware(300), blogController.getBlogById);
router.get('/:id/related', cacheMiddleware(300), blogController.getRelatedBlogs);
router.get('/category/:categoryId', cacheMiddleware(300), blogController.getBlogsByCategory);
router.get('/author/:authorId', cacheMiddleware(300), blogController.getBlogsByAuthor);

// Comment routes (public read, protected write)
router.get('/:blogId/comments', cacheMiddleware(300), commentController.getBlogComments);

// Protected routes
router.use(protect);

// Blog routes
router.post('/', createBlogValidation, validate, blogController.createBlog);
router.patch('/:id', updateBlogValidation, validate, blogController.updateBlog);
router.delete('/:id', blogController.deleteBlog);
router.post('/:id/like', blogController.toggleLike);
router.get('/user/me', blogController.getUserBlogs);

// Comment routes
router.post('/:blogId/comments', createCommentValidation, validate, commentController.addComment);
router.post('/:blogId/comments/:commentId/reply', createCommentValidation, validate, commentController.replyToComment);
router.patch('/comments/:id', createCommentValidation, validate, commentController.updateComment);
router.delete('/comments/:id', commentController.deleteComment);
router.post('/comments/:id/like', commentController.toggleLike);

module.exports = router;