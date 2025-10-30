import { USER_ROLES } from '../utils/constants.js';
import { responseUtils } from '../utils/response.js';

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(responseUtils.error('Usuario no autenticado', 401));
    }

    if (!allowedRoles.includes(req.user.roleId)) {
      return res.status(403).json(responseUtils.error('Acceso denegado. Permisos insuficientes', 403));
    }

    next();
  };
};

// Middlewares específicos por rol
export const requireAdmin = requireRole([USER_ROLES.ADMIN]);
export const requireTrader = requireRole([USER_ROLES.TRADER]);
export const requireAnalyst = requireRole([USER_ROLES.ANALYST]);
export const requireAdminOrAnalyst = requireRole([USER_ROLES.ADMIN, USER_ROLES.ANALYST]);