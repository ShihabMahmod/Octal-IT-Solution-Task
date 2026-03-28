const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userRepository = require('../repositories/userRepository');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

class AuthService {
  generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });
  }

  createSendToken(user, statusCode, res) {
    const token = this.generateToken(user._id);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
      success: true,
      token,
      data: user
    });
  }

  async register(userData) {
    try {
      // Check if user exists
      const existingUser = await userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new ApiError(400, 'User already exists with this email');
      }

      // Create user
      const user = await userRepository.create(userData);
      
      return user;
    } catch (error) {
      logger.error('AuthService.register error:', error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      // Check if user exists
      const user = await userRepository.findByEmail(email);
      if (!user) {
        throw new ApiError(401, 'Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new ApiError(401, 'Your account has been deactivated. Please contact support.');
      }

      // Check password
      const isPasswordCorrect = await user.comparePassword(password);
      if (!isPasswordCorrect) {
        throw new ApiError(401, 'Invalid email or password');
      }

      // Update last login
      await userRepository.updateLastLogin(user._id);

      return user;
    } catch (error) {
      logger.error('AuthService.login error:', error);
      throw error;
    }
  }

  async forgotPassword(email) {
    try {
      const user = await userRepository.findByEmail(email);
      if (!user) {
        throw new ApiError(404, 'No user found with this email');
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      user.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      
      user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

      await user.save({ validateBeforeSave: false });

      return resetToken;
    } catch (error) {
      logger.error('AuthService.forgotPassword error:', error);
      throw error;
    }
  }

  async resetPassword(token, newPassword) {
    try {
      // Hash token
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // Find user with valid token
      const user = await userRepository.findByResetToken(hashedToken);
      
      if (!user) {
        throw new ApiError(400, 'Token is invalid or has expired');
      }

      // Update password
      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to ensure token is created after password change

      await user.save();

      return user;
    } catch (error) {
      logger.error('AuthService.resetPassword error:', error);
      throw error;
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await userRepository.findById(userId, true);
      
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Check current password
      const isPasswordCorrect = await user.comparePassword(currentPassword);
      if (!isPasswordCorrect) {
        throw new ApiError(401, 'Current password is incorrect');
      }

      // Update password
      user.password = newPassword;
      user.passwordChangedAt = Date.now() - 1000;
      
      await user.save();

      return user;
    } catch (error) {
      logger.error('AuthService.changePassword error:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();