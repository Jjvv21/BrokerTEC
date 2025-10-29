// auth.middleware.js - VERSION DEBUG
import { jwtUtils } from '../utils/jwt.js';
import { responseUtils } from '../utils/response.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('🔐 [AuthMiddleware] Headers recibidos:', req.headers);
  console.log('🔐 [AuthMiddleware] Token recibido:', token ? '✅ Presente' : '❌ Ausente');

  if (!token) {
    console.log('❌ [AuthMiddleware] No token provided');
    return res.status(401).json(responseUtils.error('Token de acceso requerido', 401));
  }

  try {
    console.log('🔍 [AuthMiddleware] Verificando token...');
    const decoded = jwtUtils.verifyToken(token);
    console.log('✅ [AuthMiddleware] Token decodificado:', decoded);
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ [AuthMiddleware] Error verificando token:', error);
    return res.status(403).json(responseUtils.error('Token inválido o expirado', 403));
  }
};