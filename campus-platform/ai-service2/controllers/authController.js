const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');

exports.register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;
  const result = await authService.register(name, email, password);

  res.status(201).json({
    status: 'success',
    message: 'Registration successful.',
    data: result,
  });
});

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  res.status(200).json({
    status: 'success',
    message: 'Login successful.',
    data: result,
  });
});

exports.getProfile = catchAsync(async (req, res) => {
  const profile = await authService.getProfile(req.user._id);

  res.status(200).json({
    status: 'success',
    data: { user: profile },
  });
});
