const { body, param, query } = require('express-validator');

const createBlogValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
    .isLength({ min: 50 }).withMessage('Content must be at least 50 characters'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Excerpt cannot exceed 500 characters'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Invalid category ID'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  body('featuredImage')
    .optional()
    .isURL().withMessage('Featured image must be a valid URL'),
  body('status')
    .optional()
    .isIn(['draft', 'published']).withMessage('Status must be either draft or published')
];

const updateBlogValidation = [
  param('id')
    .isMongoId().withMessage('Invalid blog ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 50 }).withMessage('Content must be at least 50 characters'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Excerpt cannot exceed 500 characters'),
  body('category')
    .optional()
    .isMongoId().withMessage('Invalid category ID'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived']).withMessage('Invalid status')
];

const createCategoryValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Category name must be between 2 and 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters')
];

const updateCategoryValidation = [
  param('id')
    .isMongoId().withMessage('Invalid category ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Category name must be between 2 and 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters')
];

const createCommentValidation = [
  body('content')
    .trim()
    .notEmpty().withMessage('Comment content is required')
    .isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters')
];

module.exports = {
  createBlogValidation,
  updateBlogValidation,
  createCategoryValidation,
  updateCategoryValidation,
  createCommentValidation
};