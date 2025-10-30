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