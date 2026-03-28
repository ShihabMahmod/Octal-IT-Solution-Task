const { body, param } = require('express-validator');

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('profilePicture')
    .optional()
    .isURL().withMessage('Profile picture must be a valid URL')
];

const updateUserRoleValidation = [
  param('id')
    .isMongoId().withMessage('Invalid user ID'),
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['user', 'admin']).withMessage('Role must be either user or admin')
];

module.exports = {
  updateProfileValidation,
  updateUserRoleValidation
};