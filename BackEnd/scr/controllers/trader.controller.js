import { TraderService } from '../services/trader.service.js';

const traderService = new TraderService();

export const buyStock = async (req, res) => {
  try {
    console.log(' buyStock llamado');
    console.log(' req.user:', req.user);
    
    const userId = req.user.userId; // ✅ CORRECTO
    const { companyId, cantidad } = req.body;
    
    console.log(' Datos recibidos:', { userId, companyId, cantidad });
    
    const result = await traderService.buyStock(userId, companyId, cantidad);
    
    console.log(' Compra exitosa:', result);
    res.status(200).json(result);
  } catch (err) {
    console.error(' ERROR en buyStock:');
    console.error(' Mensaje:', err.message);
    console.error(' Stack:', err.stack);
    res.status(400).json({ error: err.message });
  }
};

export const sellStock = async (req, res) => {
  try {
    console.log(' sellStock llamado');
    console.log(' req.user:', req.user);
    
    const userId = req.user.userId; // ✅ CORRECTO
    const { companyId, cantidad } = req.body;
    
    console.log(' Datos recibidos:', { userId, companyId, cantidad });
    
    const result = await traderService.sellStock(userId, companyId, cantidad);
    
    console.log(' Venta exitosa:', result);
    res.status(200).json(result);
  } catch (err) {
    console.error(' ERROR en sellStock:');
    console.error(' Mensaje:', err.message);
    console.error(' Stack:', err.stack);
    res.status(400).json({ error: err.message });
  }
};

export const getMaxBuyable = async (req, res) => {
  try {
    console.log(' getMaxBuyable llamado');
    console.log(' req.user:', req.user);
    
    const userId = req.user.userId; // ✅ CORRECTO
    const { companyId } = req.params;

    console.log(' Parámetros:', { userId, companyId });
    
    const result = await traderService.getMaxBuyable(userId, companyId);
    
    console.log(' Máximo comprable:', result);
    res.status(200).json(result);
  } catch (err) {
    console.error(' ERROR en getMaxBuyable:');
    console.error(' Mensaje:', err.message);
    console.error(' Stack:', err.stack);
    res.status(400).json({ error: err.message });
  }
};

export const rechargeWallet = async (req, res) => {
  try {
    console.log(' rechargeWallet llamado');
    console.log(' req.user:', req.user);
    
    const userId = req.user.userId; //  CORRECTO
    const { amount } = req.body;
    
    console.log(' Datos recibidos:', { userId, amount });

    const result = await traderService.rechargeWallet(userId, amount);
    
    console.log(' Recarga exitosa:', result);
    res.status(200).json(result);
  } catch (err) {
    console.error(' ERROR en rechargeWallet:');
    console.error(' Mensaje:', err.message);
    console.error(' Stack:', err.stack);
    res.status(400).json({ error: err.message });
  }
};

export const getWalletInfo = async (req, res) => {
  try {
    console.log(' getWalletInfo llamado');
    console.log(' req.user:', req.user);
    console.log(' req.user.userId:', req.user?.userId); // ✅ AGREGADO
    console.log(' req.user.id:', req.user?.id);
    
    const userId = req.user.userId; // ✅ CORRECTO
    console.log(' userId final:', userId); // ✅ AGREGADO
    
    console.log(' Llamando a traderService.getWalletInfo...');
    const result = await traderService.getWalletInfo(userId);
    
    console.log(' Wallet data obtenida:', result);
    res.status(200).json(result);
  } catch (err) {
    console.error(' ERROR CRÍTICO en getWalletInfo:');
    console.error(' Mensaje:', err.message);
    console.error(' Stack:', err.stack);
    res.status(400).json({ error: err.message });
  }
};

export const getPortfolio = async (req, res) => {
  try {
    console.log(' getPortfolio llamado');
    console.log(' req.user:', req.user);
    console.log(' req.user.userId:', req.user?.userId); // ✅ AGREGADO
    console.log(' req.user.id:', req.user?.id);
    
    const userId = req.user.userId; // ✅ CORRECTO
    console.log(' userId final:', userId); // ✅ AGREGADO
    
    console.log(' Llamando a traderService.getPortfolio...');
    const result = await traderService.getPortfolio(userId);
    
    console.log(' Portfolio data obtenida:', result);
    res.status(200).json(result);
  } catch (err) {
    console.error(' ERROR CRÍTICO en getPortfolio:');
    console.error(' Mensaje:', err.message);
    console.error(' Stack:', err.stack);
    res.status(400).json({ error: err.message });
  }
};

export const liquidateAll = async (req, res) => {
  try {
    console.log(' liquidateAll llamado');
    console.log(' req.user:', req.user);
    
    const userId = req.user.userId; // ✅ CORRECTO
    const { password } = req.body;
    
    console.log(' Datos recibidos:', { userId });
    
    const result = await traderService.liquidateAll(userId, password);
    
    console.log(' Liquidación exitosa:', result);
    res.status(200).json(result);
  } catch (err) {
    console.error(' ERROR en liquidateAll:');
    console.error(' Mensaje:', err.message);
    console.error(' Stack:', err.stack);
    res.status(400).json({ error: err.message });
  }
};

export const getHomeData = async (req, res) => {
  try {
    console.log(' getHomeData llamado');
    console.log(' req.user:', req.user);
    
    const userId = req.user.userId; // ✅ CORRECTO
    
    console.log(' Llamando a traderService.getHomeData...');
    const result = await traderService.getHomeData(userId);
    
    console.log('Home data obtenida:', result);
    res.status(200).json(result);
  } catch (err) {
    console.error(' ERROR en getHomeData:');
    console.error(' Mensaje:', err.message);
    console.error(' Stack:', err.stack);
    res.status(400).json({ error: err.message });
  }
};

export const getCompanyDetail = async (req, res) => {
  try {
    console.log(' getCompanyDetail llamado');
    
    const { companyId } = req.params;
    
    console.log(' Parámetros:', { companyId });
    
    const result = await traderService.getCompanyDetail(companyId);
    
    console.log(' Company detail obtenido:', result);
    res.status(200).json(result);
  } catch (err) {
    console.error(' ERROR en getCompanyDetail:');
    console.error(' Mensaje:', err.message);
    console.error(' Stack:', err.stack);
    res.status(400).json({ error: err.message });
  }
};

export const getPriceHistory = async (req, res) => {
  try {
    console.log(' getPriceHistory llamado');
    
    const { companyId } = req.params;
    
    console.log(' Parámetros:', { companyId });
    
    const result = await traderService.getPriceHistory(companyId);
    
    console.log(' Price history obtenido:', result);
    res.status(200).json(result);
  } catch (err) {
    console.error(' ERROR en getPriceHistory:');
    console.error(' Mensaje:', err.message);
    console.error('Stack:', err.stack);
    res.status(400).json({ error: err.message });
  }
};