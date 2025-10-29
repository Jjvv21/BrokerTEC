import * as AdminService from '../services/admin.service.js';

export const createMarket = async (req, res) => {
  try {
    const marketData = req.body;
    const result = await AdminService.createMarket(marketData);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateMarket = async (req, res) => {
  try {
    const { marketId } = req.params;
    const marketData = req.body;
    const result = await AdminService.updateMarket(marketId, marketData);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteMarket = async (req, res) => {
  try {
    const { marketId } = req.params;
    const result = await AdminService.deleteMarket(marketId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const createCompany = async (req, res) => {
  try {
    const companyData = req.body;
    const result = await AdminService.createCompany(companyData);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const companyData = req.body;
    const result = await AdminService.updateCompany(companyId, companyData);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const delistCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { justification } = req.body;
    const adminId = req.user.userId; // ✅ AGREGADO - ID del admin que ejecuta
    const result = await AdminService.delistCompany(companyId, justification, adminId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateStockPrice = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { newPrice } = req.body;
    const result = await AdminService.updateStockPrice(companyId, newPrice);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const disableUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { justification } = req.body;
    const adminId = req.user.userId; // ✅ AGREGADO - ID del admin que ejecuta
    const result = await AdminService.disableUser(userId, justification, adminId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const assignCategory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { category } = req.body;
    const result = await AdminService.assignCategory(userId, category);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getTopTraders = async (req, res) => {
  try {
    const result = await AdminService.getTopTraders();
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};