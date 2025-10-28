import { getConnection } from '../config/db.js';
import sql from 'mssql';
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
    if (price <= 0) return 0;
    const maxByBalance = Math.floor(balance / price);
    return Math.min(maxByBalance, availableShares);
  }

  /**
   * Formatea moneda USD
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  /**
   * Calcula variación porcentual
   */
  calculateChange(current, previous) {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Genera alias único
   */
  generateUniqueAlias(baseName) {
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.random().toString(36).substring(2, 5);
    return `${baseName.toLowerCase().replace(/\s+/g, '')}${timestamp}${random}`;
  }

  /**
   * Valida fortaleza de contraseña
   */
  validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }

  /**
   * Sanitiza entrada de texto
   */
  sanitizeText(text) {
    if (typeof text !== 'string') return '';
    return text.trim().replace(/[<>]/g, '');
  }

  /**
   * Calcula edad en días
   */
  getDaysDifference(date) {
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(date);
    const secondDate = new Date();
    return Math.round(Math.abs((firstDate - secondDate) / oneDay));
  }

  /**
   * Formatea fecha para BD
   */
  formatDateForDB(date) {
    return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
  }

  /**
   * Obtiene fecha de inicio del día
   */
  getStartOfDay(date = new Date()) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  /**
   * Obtiene fecha de fin del día
   */
  getEndOfDay(date = new Date()) {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
  }
}