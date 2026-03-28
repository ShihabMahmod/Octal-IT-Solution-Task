const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ApiError(401, 'You are not logged in. Please log in to access this resource.'));
    }

    // Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new ApiError(401, 'The user belonging to this token no longer exists.'));
    }

    // Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return next(new ApiError(401, 'User recently changed password. Please log in again.'));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new ApiError(401, 'Your account has been deactivated. Please contact support.'));
    }

    // Grant access
    req.user = user;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return next(new ApiError(401, 'Invalid token or authentication failed.'));
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action.'));
    }
    next();
  };
};

module.exports = { protect, restrictTo };