const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = process.env;

// Middleware para proteger rutas
module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('No token provided');
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    next();
  } catch (err) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};