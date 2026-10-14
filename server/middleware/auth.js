const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler, httpError } = require('./error');

const secret = () => process.env.JWT_SECRET || 'dev-secret-change-me';

const signToken = (user) => jwt.sign({ id: user._id, role: user.role }, secret(), { expiresIn: '7d' });

// Requires a valid "Authorization: Bearer <token>" header.
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) throw httpError(401, 'Please log in first');
  let payload;
  try {
    payload = jwt.verify(header.slice(7), secret());
  } catch (e) {
    throw httpError(401, 'Your session expired. Please log in again');
  }
  const user = await User.findById(payload.id).select('-password');
  if (!user) throw httpError(401, 'Account no longer exists');
  req.user = user;
  next();
});

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') return next(httpError(403, 'Admins only'));
  next();
};

module.exports = { protect, adminOnly, signToken };
