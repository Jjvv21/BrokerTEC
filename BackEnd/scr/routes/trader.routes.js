import { Router } from 'express';
import { 
  buyStock, 
  sellStock, 
  getMaxBuyable, 
  rechargeWallet, 
  getWalletInfo, 
  getPortfolio, 
  liquidateAll, 
  getHomeData, 
  getCompanyDetail, 
  getPriceHistory 
} from '../controllers/trader.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js'; // ← SOLO authenticateToken
import { requireTrader } from '../middlewares/role.middleware.js'; // ← requireTrader desde role.middleware
import { validateTrade, validateRecharge } from '../middlewares/validate.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación y rol Trader
router.use(authenticateToken, requireTrader);

// Operaciones de trading
router.post('/buy', validateTrade, buyStock);
router.post('/sell', validateTrade, sellStock);
router.get('/max-buyable/:companyId', getMaxBuyable);

// Wallet y portfolio
router.post('/recharge', validateRecharge, rechargeWallet);
router.get('/wallet', getWalletInfo);
router.get('/portfolio', getPortfolio);

// Liquidación
router.post('/liquidate', liquidateAll);

// Datos de mercado
router.get('/home', getHomeData);
router.get('/company/:companyId', getCompanyDetail);
router.get('/price-history/:companyId', getPriceHistory);

export default router;