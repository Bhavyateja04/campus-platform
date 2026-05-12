const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * Auth Service
 * Handles user registration and login.
 */
class AuthService {
  async register(name, email, password) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already registered.', 409);
    }

    const user = await User.create({ name, email, password });
    const token = user.generateToken();

    return { user: user.toSafeObject(), token };
  }

  async login(email, password) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated. Contact support.', 403);
    }

    const token = user.generateToken();
    return { user: user.toSafeObject(), token };
  }

  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return user.toSafeObject();
  }
}

module.exports = new AuthService();
