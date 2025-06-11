const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { 
      expiresIn: '7d' 
    });
    
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(401).send({ error: 'Credenciales inválidas' });
    
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) return res.status(401).send({ error: 'Credenciales inválidas' });
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { 
      expiresIn: '7d' 
    });
    
    res.send({ user, token });
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;