const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = process.env;

// Funciones específicas para registro/login
exports.register = async (req, res) => { /* ... */ };
exports.login = async (req, res) => { /* ... */ };