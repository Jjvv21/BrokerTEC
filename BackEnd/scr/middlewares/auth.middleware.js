import { jwtUtils } from '../utils/jwt.js';
import { responseUtils } from '../utils/response.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json(responseUtils.error('Token de acceso requerido', 401));
  }

  try {
    const decoded = jwtUtils.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json(responseUtils.error('Token inválido o expirado', 403));
  }
};