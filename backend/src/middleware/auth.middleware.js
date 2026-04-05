const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: 'No token' });

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ message: 'Invalid token' });

    req.user = user; // 🔑 VERY IMPORTANT
    next();
  } catch (err) {
    res.status(401).json({ message: 'Auth failed' });
  }
};