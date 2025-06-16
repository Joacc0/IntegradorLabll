import jwt from 'jsonwebtoken';
import db from '../models/index.js';

export const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Acceso no autorizado. Por favor inicie sesión.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await db.User.findByPk(decoded.id, {
      attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage'],
      raw: true
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Usuario no encontrado' 
      });
    }

    req.user = user;
    next();
    
  } catch (err) {
    const errorMessage = err.name === 'TokenExpiredError' 
      ? 'Token expirado. Por favor inicie sesión nuevamente.'
      : 'Token inválido';
    
    return res.status(401).json({ 
      success: false, 
      error: errorMessage 
    });
  }
};