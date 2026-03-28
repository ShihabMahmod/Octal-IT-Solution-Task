const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middlewares/auth');
const { cacheMiddleware, clearCache } = require('../middlewares/cache');
const validate = require('../middlewares/validation');
const { updateUserRoleValidation } = require('../validations/userValidation');

router.use(protect);
router.use(restrictTo('admin'));

// Dashboard
router.get('/dashboard/stats', cacheMiddleware(600), adminController.getDashboardStats);

// User management
router.get('/users', cacheMiddleware(300), adminController.getAllUsers);
router.get('/users/:id', cacheMiddleware(300), adminController.getUserDetails);
router.patch('/users/:id/toggle-status', adminController.toggleUserStatus);
router.patch('/users/:id/role', updateUserRoleValidation, validate, adminController.updateUserRole);

// Blog management
router.get('/blogs', cacheMiddleware(300), adminController.getAllBlogs);
router.patch('/blogs/:id/status', adminController.updateBlogStatus);
router.patch('/blogs/:id/feature', adminController.toggleFeatured);

// Category management
router.get('/categories', cacheMiddleware(300), adminController.getAllCategories);

// Comment management
router.get('/comments', cacheMiddleware(300), adminController.getAllComments);
router.patch('/comments/:id/approve', adminController.approveComment);

module.exports = router;