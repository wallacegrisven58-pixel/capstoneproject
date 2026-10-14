const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { asyncHandler, httpError } = require('../middleware/error');
const { signToken } = require('../middleware/auth');

const publicUser = (u) => ({ id: u._id, username: u.username, email: u.email, role: u.role, createdAt: u.createdAt });

exports.register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) throw httpError(400, 'Name, email and password are required');
  if (String(password).length < 6) throw httpError(400, 'Use a password with at least 6 characters');
  if (await User.findOne({ email: String(email).toLowerCase() })) {
    throw httpError(409, 'That email already has an account. Log in instead');
  }
  const hashed = await bcrypt.hash(password, 10);
  // Role is always "user" here. Admin accounts are created by the seed script.
  const user = await User.create({ username, email, password: hashed });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() });
  if (!user || !(await bcrypt.compare(String(password || ''), user.password))) {
    throw httpError(401, 'Email or password is not right');
  }
  res.json({ token: signToken(user), user: publicUser(user) });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});
