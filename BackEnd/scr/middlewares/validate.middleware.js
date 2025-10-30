import { responseUtils } from '../utils/response.js';
import { logger } from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('Error no manejado:', err);

  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json(responseUtils.validationError(err.details));
  }

  // Error de base de datos
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json(responseUtils.error('Registro duplicado', 409));
  }

  // Error de autenticación
  if (err.message.includes('Token') || err.message.includes('autenticación')) {
    return res.status(401).json(responseUtils.error(err.message, 401));
  }

  // Error genérico
  res.status(500).json(responseUtils.error('Error interno del servidor', 500));
};

// Middleware para rutas no encontradas
export const notFoundHandler = (req, res) => {
  res.status(404).json(responseUtils.error(`Ruta no encontrada: ${req.method} ${req.path}`, 404));
};

// Validación para creación de usuario
export const validateUser = (req, res, next) => {
  const { nombre, alias, correo, contrasena } = req.body;

  const errors = [];

  if (!nombre || nombre.length < 2) {
    errors.push('Nombre debe tener al menos 2 caracteres');
  }

  if (!alias || alias.length < 3) {
    errors.push('Alias debe tener al menos 3 caracteres');
  }

  if (!correo || !correo.includes('@')) {
    errors.push('Correo electrónico inválido');
  }

  if (!contrasena || contrasena.length < 6) {
    errors.push('Contraseña debe tener al menos 6 caracteres');
  }

  if (errors.length > 0) {
    return res.status(400).json(responseUtils.validationError(errors));
  }

  next();
};

// Validación para recarga de wallet
export const validateRecharge = (req, res, next) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json(
      responseUtils.error('Monto de recarga inválido', 400)
    );
  }

  if (amount > 1000000) { // Límite máximo por recarga
    return res.status(400).json(
      responseUtils.error('Monto de recarga excede el límite permitido', 400)
    );
  }

  next();
};

// Validación para operaciones de trading
export const validateTrade = (req, res, next) => {
  const { companyId, cantidad } = req.body;

  if (!companyId || !cantidad) {
    return res.status(400).json(
      responseUtils.error('companyId y cantidad son requeridos', 400)
    );
  }

  if (cantidad <= 0) {
    return res.status(400).json(
      responseUtils.error('La cantidad debe ser mayor a 0', 400)
    );
  }

  next();
};