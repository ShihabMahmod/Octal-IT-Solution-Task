const authService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

class AuthController {
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      
      // Send welcome email (implement email service)
      // await emailService.sendWelcomeEmail(user.email, user.name);
      
      authService.createSendToken(user, 201, res);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      const user = await authService.login(email, password);
      
      authService.createSendToken(user, 200, res);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res) {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      
      const resetToken = await authService.forgotPassword(email);
      
      // Send reset email (implement email service)
      // const resetURL = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
      // await emailService.sendPasswordResetEmail(email, resetURL);
      
      ApiResponse.success(res, null, 'Password reset email sent');
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token } = req.params;
      const { password } = req.body;
      
      const user = await authService.resetPassword(token, password);
      
      authService.createSendToken(user, 200, res);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      await authService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );
      
      ApiResponse.success(res, null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res) {
    ApiResponse.success(res, req.user, 'User profile retrieved');
  }
}

module.exports = new AuthController();