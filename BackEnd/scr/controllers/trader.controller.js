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