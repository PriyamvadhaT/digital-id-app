const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerAdmin = async (req, res) => {
  try {
    let { username, password } = req.body;
    username = username ? username.trim().toLowerCase() : "";

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const admin = await User.create({
      username,
      password: hashed,
      role: "admin",
      isActive: true,
      isFirstLogin: false
    });

    res.status(201).json({
      message: "Admin created successfully"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {

  try {
    let { username, password } = req.body;
    username = username ? username.trim().toLowerCase() : "";

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        message: 'Account deleted or not found'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: 'User deactivated'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        profileId: user.profileId
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      role: user.role,
      userId: user._id,
      adminId: user.adminId || user._id, // 🔥 important
      requiresPasswordChange: user.isFirstLogin
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
exports.me = async (req, res) => {
  try {
    const user = req.user; // from auth middleware

    let profile = null;

    if (user.role === 'Student') {
      const Student = require('../models/student.model');
      profile = await Student.findById(user.profileId);
    }

    if (user.role === 'Employee') {
      const Employee = require('../models/employee.model');
      profile = await Employee.findById(user.profileId);
    }

    res.json({
      username: user.username,
      role: user.role,
      profile
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const user = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Current password and new password are required'
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Current password is incorrect'
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    user.isFirstLogin = false;
    await user.save();

    res.json({ message: 'Password updated successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
