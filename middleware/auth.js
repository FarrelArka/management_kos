const jwt = require("jsonwebtoken");
const { User } = require("../models");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

async function authenticate(req, res, next) {
  try {
    const token = req.cookies.token; // ambil token dari cookie

    if (!token) {
      return res.status(401).json({ message: "No token, please login first" });
    }

    const payload = jwt.verify(token, JWT_SECRET);

    const user = await User.findByPk(payload.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // simpan user ke req biar bisa dipakai di controller
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = authenticate;
