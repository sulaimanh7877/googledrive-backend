const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivationToken = require('../models/ActivationToken');
const PasswordResetToken = require('../models/PasswordResetToken');
const EmailService = require('./emailService');
const AppError = require('../utils/AppError');

class AuthService {
  static signToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }

  static async register(data) {
    const existing = await User.findOne({ email: data.email });
    if (existing) throw new AppError('Email already in use', 400);

    const user = await User.create(data);
    
    // Generate Activation Token
    const token = crypto.randomBytes(32).toString('hex');
    await ActivationToken.create({ user: user._id, token });

    await EmailService.sendActivationEmail(user.email, token);

    return user;
  }

  static async activate(token) {
    const activationRecord = await ActivationToken.findOne({ token }).populate('user');
    if (!activationRecord) throw new AppError('Invalid or expired activation token', 400);

    const user = activationRecord.user;
    user.isActive = true;
    await user.save();
    
    await ActivationToken.deleteOne({ _id: activationRecord._id });
    return user;
  }

  static async login(email, password) {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new AppError('Incorrect email or password', 401);
    }
    if (!user.isActive) {
      throw new AppError('Account not activated', 403);
    }

    const token = this.signToken(user._id);
    return { token, user };
  }

  static async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) throw new AppError('No user found with that email', 404);

    const token = crypto.randomBytes(32).toString('hex');
    await PasswordResetToken.create({ user: user._id, token });

    await EmailService.sendPasswordResetEmail(user.email, token);
  }

  static async resetPassword(token, newPassword) {
    const resetRecord = await PasswordResetToken.findOne({ token }).populate('user');
    if (!resetRecord) throw new AppError('Invalid or expired reset token', 400);

    const user = resetRecord.user;
    user.password = newPassword;
    await user.save();

    await PasswordResetToken.deleteOne({ _id: resetRecord._id });
  }
}

module.exports = AuthService;