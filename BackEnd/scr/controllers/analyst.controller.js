import * as AnalystService from '../services/analyst.service.js';

export const getCompanyReport = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { startDate, endDate } = req.query;
    const result = await AnalystService.getCompanyReport(companyId, startDate, endDate);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getUserReport = async (req, res) => {
  try {
    const { userAlias } = req.params;
    const { startDate, endDate } = req.query;
    const result = await AnalystService.getUserReport(userAlias, startDate, endDate);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getMarketStats = async (req, res) => {
  try {
    const { marketId } = req.params;
    const result = await AnalystService.getMarketStats(marketId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getTreasuryInventory = async (req, res) => {
  try {
    const result = await AnalystService.getTreasuryInventory();
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getOwnershipDistribution = async (req, res) => {
  try {
    const { level } = req.query; // 'market' o 'company'
    const result = await AnalystService.getOwnershipDistribution(level);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};