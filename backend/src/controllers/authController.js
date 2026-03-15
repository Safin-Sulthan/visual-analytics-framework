const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const User = require('../models/User');
const { signAccessToken, signRefreshToken } = require('../utils/jwtHelper');
const { success, created, badRequest, unauthorized, conflict } = require('../utils/apiResponse');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return conflict(res, 'Email is already registered');

    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await User.create({ name, email, password: hashed });

    const payload = { id: user._id, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return created(res, {
      user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error('[authController.register]', err);
    return badRequest(res, err.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) return unauthorized(res, 'Invalid email or password');

    const match = await bcrypt.compare(password, user.password);
    if (!match) return unauthorized(res, 'Invalid email or password');

    const payload = { id: user._id, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return success(res, {
      user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error('[authController.login]', err);
    return badRequest(res, err.message);
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return unauthorized(res, 'User not found');
    return success(res, {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error('[authController.me]', err);
    return badRequest(res, err.message);
  }
};

module.exports = { register, login, me, registerValidation, loginValidation };
