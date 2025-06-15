import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

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
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse('El email ya está registrado', 400));
  }

  // Crear usuario
  const user = await User.create({
    firstName,
    lastName,
    email,
    password
  });

  // Generar token JWT
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
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

  // Buscar usuario incluyendo la contraseña (que normalmente está oculta)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Credenciales inválidas', 401));
  }

  // Verificar contraseña
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse('Credenciales inválidas', 401));
  }

  // Generar token JWT
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profileImage: user.profileImage
    }
  });
});

/**
 * @desc    Obtener información del usuario actual
 * @route   GET /api/auth/me
 * @access  Privado (requiere autenticación)
 */
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate('friends', 'firstName lastName profileImage')
    .populate('friendRequests', 'firstName lastName profileImage');

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
 * @param {String} id - ID del usuario
 * @returns {String} Token JWT
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};