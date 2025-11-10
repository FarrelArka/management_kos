const bcrypt = require("bcrypt");
const { User } = require("../models");
const SALT_ROUNDS = 10;

// 🧩 Edit Profile
exports.editProfile = async (req, res) => {
  try {
    const user = req.user; // data dari middleware auth
    const { name, email, phone, password } = req.body;

    console.log(`✏️ Edit profile request for user: ${user.email}`);

    // Update field jika ada
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    // Jika user mau ganti password
    if (password) {
      const hashed = await bcrypt.hash(password, SALT_ROUNDS);
      user.password = hashed;
      console.log("🔐 Password updated");
    }

    await user.save();

    console.log(`✅ Profile updated: ${user.email}`);

    return res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Edit profile error:", err);
    return res.status(500).json({ message: err.message });
  }
};
