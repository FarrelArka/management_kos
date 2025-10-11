const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

// 🧩 Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      name,
      email,
      password: hashed,
      phone,
      role: role || 'society'
    });

    console.log(`✅ User registered: ${email}`);
    return res.json({
      message: 'Registered',
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('❌ Register error:', err);
    return res.status(500).json({ message: err.message });
  }
};

// 🧩 Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('📩 Login attempt:', email);

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('❌ User not found');
      return res.status(400).json({ message: 'User not found' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log('❌ Invalid password for', email);
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    console.log('🔑 JWT created:', token);

    // simpan di cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,     // local only
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000
    });

    console.log('🍪 Cookie set for user:', email);

    return res.json({
      message: 'Login success',
      user: { id: user.id, role: user.role }
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    return res.status(500).json({ message: err.message });
  }
};

// 🧩 Check Session
exports.checkSession = async (req, res) => {
  try {
    console.log('🕵️ Checking session...');
    console.log('Request cookies:', req.cookies); // debug isi cookie yg dikirim browser

    if (!req.user) {
      console.log('❌ No user found in req.user');
      return res.status(401).json({ message: 'Not authenticated' });
    }

    console.log('✅ Session valid for:', req.user.email);

    return res.json({
      message: 'Authenticated',
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (err) {
    console.error('❌ checkSession error:', err);
    return res.status(500).json({ message: err.message });
  }
};

// 🧩 Logout
exports.logout = (req, res) => {
  console.log('🚪 Logging out user, clearing token cookie');
  res.clearCookie('token');
  return res.json({ message: 'Logged out' });
};

// 🧩 Optional upgrade
exports.upgradeToOwner = async (req, res) => {
  try {
    const user = req.user;
    if (user.role === 'owner')
      return res.status(400).json({ message: 'Already owner' });

    user.role = 'owner';
    await user.save();
    console.log(`⬆️ Upgraded user ${user.email} to owner`);
    return res.json({
      message: 'Upgraded to owner',
      user: { id: user.id, role: user.role }
    });
  } catch (err) {
    console.error('❌ upgradeToOwner error:', err);
    return res.status(500).json({ message: err.message });
  }
};
