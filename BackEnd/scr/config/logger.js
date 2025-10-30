/**
 * Sistema de logging para BrokerTEC
 * Registra eventos con timestamp para auditoría y debugging
 */

export const logger = {
  /**
   * Registra información general del sistema
   */
  info: (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[INFO] ${timestamp}: ${message}`);
    if (data) {
      console.log(`[DATA] ${JSON.stringify(data, null, 2)}`);
    }
  },

  /**
   * Registra errores del sistema
   */
  error: (message, error = null) => {
    const timestamp = new Date().toISOString();
    console.error(`[ERROR] ${timestamp}: ${message}`);
    if (error) {
      console.error(`[STACK] ${error.stack}`);
    }
  },

  /**
   * Registra advertencias
   */
  warn: (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.warn(`[WARN] ${timestamp}: ${message}`);
    if (data) {
      console.warn(`[DATA] ${JSON.stringify(data, null, 2)}`);
    }
  },

  /**
   * Registra operaciones de base de datos
   */
  db: (operation, query = '', params = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[DB] ${timestamp}: ${operation}`);
    if (query) console.log(`[QUERY] ${query}`);
    if (Object.keys(params).length > 0) {
      console.log(`[PARAMS] ${JSON.stringify(params)}`);
    }
  }
};