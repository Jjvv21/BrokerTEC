import { Router } from 'express';
import { 
  createMarket, 
  updateMarket, 
  deleteMarket, 
  createCompany, 
  updateCompany, 
  delistCompany, 
  updateStockPrice, 
  disableUser, 
  assignCategory, 
  getTopTraders 
} from '../controllers/admin.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js'; // ← SOLO authenticateToken
import { requireAdmin } from '../middlewares/role.middleware.js'; // ← requireAdmin desde role.middleware

const router = Router();

// Todas las rutas requieren autenticación y rol Admin
router.use(authenticateToken, requireAdmin);

// Gestión de mercados
router.post('/markets', createMarket);
router.put('/markets/:marketId', updateMarket);
router.delete('/markets/:marketId', deleteMarket);

// Gestión de empresas
router.post('/companies', createCompany);
router.put('/companies/:companyId', updateCompany);
router.post('/companies/:companyId/delist', delistCompany);
router.put('/companies/:companyId/price', updateStockPrice);

// Gestión de usuarios
router.post('/users/:userId/disable', disableUser);
router.put('/users/:userId/category', assignCategory);

// Reportes
router.get('/top-traders', getTopTraders);

export default router;