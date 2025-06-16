import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';
import bcrypt from 'bcrypt';

/**
 * @desc    Registrar nuevo usuario
 * @route   POST /api/auth/register
 * @access  Público
 */
export const register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  // Validar campos obligatorios
  if (!firstName || !lastName || !email || !password) {
    return next(new ErrorResponse('Por favor proporcione todos los campos requeridos', 400));
  }

  // Verificar si el usuario ya existe
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return next(new ErrorResponse('El email ya está registrado', 400));
  }

  // Crear usuario con contraseña encriptada
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword
  });

  // Generar token JWT (usando user.id en lugar de user._id)
  const token = generateToken(user.id);

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profileImage: user.profileImage
    }
  });
});

/**
 * @desc    Iniciar sesión de usuario
 * @route   POST /api/auth/login
 * @access  Público
 */
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validar email y contraseña
  if (!email || !password) {
    return next(new ErrorResponse('Por favor ingrese un email y contraseña', 400));
  }

  // Buscar usuario incluyendo la contraseña
  const user = await User.findOne({ 
    where: { email },
    attributes: { include: ['password'] } // Incluir campo password
  });

  if (!user) {
    return next(new ErrorResponse('Credenciales inválidas', 401));
  }

  // Verificar contraseña
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new ErrorResponse('Credenciales inválidas', 401));
  }

  // Generar token JWT
  const token = generateToken(user.id);

  // Eliminar password de la respuesta
  const userWithoutPassword = { ...user.get() };
  delete userWithoutPassword.password;

  res.status(200).json({
    success: true,
    token,
    user: userWithoutPassword
  });
});

/**
 * @desc    Obtener información del usuario actual
 * @route   GET /api/auth/me
 * @access  Privado (requiere autenticación)
 */
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.user.id, {
    include: [
      { 
        model: User, 
        as: 'friends', 
        attributes: ['id', 'firstName', 'lastName', 'profileImage'],
        through: { attributes: [] } // Omitir tabla intermedia
      },
      { 
        model: User, 
        as: 'friendRequests', 
        attributes: ['id', 'firstName', 'lastName', 'profileImage'] 
      }
    ],
    attributes: { exclude: ['password'] } // Excluir password
  });

  if (!user) {
    return next(new ErrorResponse('Usuario no encontrado', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * Genera un token JWT
 * @param {Number} id - ID del usuario
 * @returns {String} Token JWT
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};