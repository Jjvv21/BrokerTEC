import { Router } from 'express';
import { 
  getCompanyReport, 
  getUserReport, 
  getMarketStats, 
  getTreasuryInventory, 
  getOwnershipDistribution 
} from '../controllers/analyst.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js'; // ← SOLO authenticateToken
import { requireAnalyst } from '../middlewares/role.middleware.js'; // ← requireAnalyst desde role.middleware
import { getAllTraders } from '../controllers/analyst.controller.js';
import { getGlobalStats } from '../controllers/analyst.controller.js';

const router = Router();

// Todas las rutas requieren autenticación y rol Analyst
router.use(authenticateToken, requireAnalyst);

router.get('/company-report/:companyId', getCompanyReport);
router.get('/user-report/:userAlias', getUserReport);
router.get('/market-stats/:marketId', getMarketStats);
router.get('/treasury-inventory', getTreasuryInventory);
router.get('/ownership-distribution', getOwnershipDistribution);
router.get('/users', getAllTraders);
router.get('/global-stats', getGlobalStats);

export default router;