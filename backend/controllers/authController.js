const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { success, error } = require('../utils/responseHelper');

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return error(res, 'Email already in use', 409);
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    return success(
      res,
      { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } },
      'User registered successfully',
      201
    );
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg, 400);
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return error(res, 'Invalid email or password', 401);
    }

    const token = signToken(user._id);

    return success(res, {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return error(res, 'User not found', 404);
    }
    return success(res, { user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { register, login, getMe };
