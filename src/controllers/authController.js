const AuthService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');

exports.register = catchAsync(async (req, res, next) => {
  await AuthService.register(req.body);
  res.status(201).json({
    success: true,
    message: 'User registered. Please check email for activation.',
  });
});

exports.activate = catchAsync(async (req, res, next) => {
  await AuthService.activate(req.params.token);
  res.status(200).json({
    success: true,
    message: 'Account activated successfully',
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const { token, user } = await AuthService.login(email, password);
  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      email: user.email,
    },
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  await AuthService.forgotPassword(req.body.email);
  res.status(200).json({
    success: true,
    message: 'Password reset link sent to email',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  await AuthService.resetPassword(req.params.token, req.body.newPassword);
  res.status(200).json({
    success: true,
    message: 'Password reset successfully',
  });
});