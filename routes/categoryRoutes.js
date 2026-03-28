const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, restrictTo } = require('../middlewares/auth');
const { cacheMiddleware } = require('../middlewares/cache');
const validate = require('../middlewares/validation');
const { createCategoryValidation, updateCategoryValidation } = require('../validations/blogValidation');

// Public routes
router.get('/', cacheMiddleware(300), categoryController.getCategories);
router.get('/with-count', cacheMiddleware(600), categoryController.getCategoriesWithCount);
router.get('/slug/:slug', cacheMiddleware(300), categoryController.getCategoryBySlug);
router.get('/:id', cacheMiddleware(300), categoryController.getCategoryById);

// Protected routes (admin only)
router.use(protect);
router.use(restrictTo('admin'));

router.post('/', createCategoryValidation, validate, categoryController.createCategory);
router.patch('/:id', updateCategoryValidation, validate, categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);
router.patch('/:id/toggle-active', categoryController.toggleActive);

module.exports = router;