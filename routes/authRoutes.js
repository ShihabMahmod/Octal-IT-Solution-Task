const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validation');
const { 
  registerValidation, 
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation 
} = require('../validations/authValidation');

router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', forgotPasswordValidation, validate, authController.forgotPassword);
router.patch('/reset-password/:token', resetPasswordValidation, validate, authController.resetPassword);
router.patch('/change-password', protect, changePasswordValidation, validate, authController.changePassword);
router.get('/me', protect, authController.getMe);

module.exports = router;