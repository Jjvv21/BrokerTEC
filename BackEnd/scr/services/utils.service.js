import { getConnection } from '../config/db.js';
import { logger } from '../config/logger.js';

export class UtilsService {
  /**
   * Ejecuta una función con transacción
   */
  async withTransaction(callback) {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);
    
    try {
      await transaction.begin();
      const result = await callback(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      logger.error('Transacción fallida', error);
      throw error;
    }
  }

  /**
   * Valida formato de email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Calcula máximo comprable
   */
  calculateMaxBuyable(balance, price, availableShares) {
    const maxByBalance = Math.floor(balance / price);
    return Math.min(maxByBalance, availableShares);
  }
}