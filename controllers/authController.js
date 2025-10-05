const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

const SALT_ROUNDS = 10;

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email, password: hashed, phone, role: role || 'society' });
    return res.json({ message: 'Registered', user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

    // simpan di cookie
    res.cookie("token", token, {
      httpOnly: true,    // ga bisa diakses lewat JS (aman dari XSS)
      secure: false,     // true kalau pakai https
      sameSite: "lax",   // atau "strict"
      maxAge: 60 * 60 * 1000 // 1 jam
    });

    return res.json({ message: "Login success", user: { id: user.id, role: user.role } });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// optional: upgrade society -> owner (society dapat registrasi sebagai owner)
exports.upgradeToOwner = async (req, res) => {
  try {
    const user = req.user;
    if (user.role === 'owner') return res.status(400).json({ message: 'Already owner' });
    user.role = 'owner';
    await user.save();
    return res.json({ message: 'Upgraded to owner', user: { id: user.id, role: user.role } });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.logout = (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "Logged out" });
};
