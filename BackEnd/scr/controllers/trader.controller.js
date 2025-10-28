import * as TraderService from '../services/trader.service.js';

export const buyStock = async (req, res) => {
  try {
    const { userId, companyId, cantidad } = req.body;
    const result = await TraderService.buyStock(userId, companyId, cantidad);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const sellStock = async (req, res) => {
  try {
    const { userId, companyId, cantidad } = req.body;
    const result = await TraderService.sellStock(userId, companyId, cantidad);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getMaxBuyable = async (req, res) => {
  try {
    const { userId, companyId } = req.params;
    const result = await TraderService.getMaxBuyable(userId, companyId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const rechargeWallet = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const result = await TraderService.rechargeWallet(userId, amount);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getWalletInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await TraderService.getWalletInfo(userId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getPortfolio = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await TraderService.getPortfolio(userId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const liquidateAll = async (req, res) => {
  try {
    const { userId, password } = req.body;
    const result = await TraderService.liquidateAll(userId, password);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getHomeData = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await TraderService.getHomeData(userId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getCompanyDetail = async (req, res) => {
  try {
    const { companyId } = req.params;
    const result = await TraderService.getCompanyDetail(companyId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getPriceHistory = async (req, res) => {
  try {
    const { companyId } = req.params;
    const result = await TraderService.getPriceHistory(companyId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};