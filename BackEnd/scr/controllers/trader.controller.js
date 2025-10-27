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

const router = Router();

// Operaciones de trading
router.post('/buy', buyStock);
router.post('/sell', sellStock);
router.get('/max-buyable/:userId/:companyId', getMaxBuyable);

// Wallet y portfolio
router.post('/recharge', rechargeWallet);
router.get('/wallet/:userId', getWalletInfo);
router.get('/portfolio/:userId', getPortfolio);

// Liquidación y seguridad
router.post('/liquidate', liquidateAll);

// Datos de mercado
router.get('/home/:userId', getHomeData);
router.get('/company/:companyId', getCompanyDetail);
router.get('/price-history/:companyId', getPriceHistory);

export default router;