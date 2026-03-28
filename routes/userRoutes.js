const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validation');
const { updateProfileValidation } = require('../validations/userValidation');

router.use(protect); // All user routes require authentication

router.get('/profile', userController.getProfile);
router.patch('/profile', updateProfileValidation, validate, userController.updateProfile);
router.get('/:id', userController.getUserById);
router.get('/:id/blogs', userController.getUserBlogs);
router.get('/:id/comments', userController.getUserComments);
router.delete('/deactivate', userController.deactivateAccount);

module.exports = router;