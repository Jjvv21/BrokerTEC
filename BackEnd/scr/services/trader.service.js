import { getConnection } from '../config/db.js';
import sql from 'mssql';
import { Trade, Position } from '../models/index.js';
import { logger } from '../config/logger.js';

export class TraderService {
  /**
   * Compra acciones de una empresa
   */
  async buyStock(userId, companyId, cantidad) {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);
    
    try {
      await transaction.begin();
      
      // Obtener precio actual y datos necesarios
      const companyResult = await transaction.request()
        .input('companyId', companyId)
        .query('SELECT precio_actual, cantidad_acciones FROM empresa WHERE id_empresa = @companyId AND activo = 1');
      
      if (companyResult.recordset.length === 0) {
        throw new Error('Empresa no disponible');
      }
      
      const { precio_actual, cantidad_acciones } = companyResult.recordset[0];
      const totalCost = precio_actual * cantidad;
      
      // Verificar saldo suficiente
      const walletResult = await transaction.request()
        .input('userId', userId)
        .query('SELECT saldo FROM wallet WHERE id_usuario = @userId');
      
      if (walletResult.recordset.length === 0 || walletResult.recordset[0].saldo < totalCost) {
        throw new Error('Saldo insuficiente');
      }
      
      // Verificar acciones disponibles en Tesorería
      const treasuryResult = await transaction.request()
        .input('companyId', companyId)
        .query('SELECT cantidad FROM tesoreria WHERE id_empresa = @companyId');
      
      const availableShares = treasuryResult.recordset[0]?.cantidad || 0;
      if (availableShares < cantidad) {
        throw new Error('Acciones insuficientes en inventario');
      }
      
      // Actualizar wallet (restar dinero)
      await transaction.request()
        .input('userId', userId)
        .input('amount', totalCost)
        .query('UPDATE wallet SET saldo = saldo - @amount WHERE id_usuario = @userId');
      
      // Actualizar tesorería (restar acciones)
      await transaction.request()
        .input('companyId', companyId)
        .input('cantidad', cantidad)
        .query('UPDATE tesoreria SET cantidad = cantidad - @cantidad WHERE id_empresa = @companyId');
      
      // Actualizar o insertar en portafolio
      await transaction.request()
        .input('userId', userId)
        .input('companyId', companyId)
        .input('cantidad', cantidad)
        .input('precio_promedio', precio_actual)
        .query(`
          MERGE portafolio AS target
          USING (VALUES (@userId, @companyId, @cantidad, @precio_promedio)) AS source (id_usuario, id_empresa, cantidad, precio_promedio)
          ON target.id_usuario = source.id_usuario AND target.id_empresa = source.id_empresa
          WHEN MATCHED THEN
            UPDATE SET 
              cantidad = target.cantidad + source.cantidad,
              precio_promedio = ((target.precio_promedio * target.cantidad) + (source.precio_promedio * source.cantidad)) / (target.cantidad + source.cantidad)
          WHEN NOT MATCHED THEN
            INSERT (id_usuario, id_empresa, cantidad, precio_promedio)
            VALUES (source.id_usuario, source.id_empresa, source.cantidad, source.precio_promedio);
        `);
      
      // Registrar transacción
      await transaction.request()
        .input('userId', userId)
        .input('companyId', companyId)
        .input('tipo', 'compra')
        .input('cantidad', cantidad)
        .input('precio', precio_actual)
        .input('total', totalCost)
        .query(`
          INSERT INTO transaccion (id_usuario, id_empresa, tipo, cantidad, precio, total, fecha)
          VALUES (@userId, @companyId, @tipo, @cantidad, @precio, @total, GETDATE())
        `);
      
      await transaction.commit();
      logger.info('Compra exitosa', { userId, companyId, cantidad, totalCost });
      
      return { 
        success: true, 
        message: 'Compra realizada exitosamente',
        totalCost,
        sharesBought: cantidad
      };
      
    } catch (error) {
      await transaction.rollback();
      logger.error('Error en compra de acciones', error);
      throw error;
    }
  }

  /**
   * Vende acciones de una empresa
   */
  async sellStock(userId, companyId, cantidad) {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);
    
    try {
      await transaction.begin();
      
      // Verificar que tiene suficientes acciones
      const portfolioResult = await transaction.request()
        .input('userId', userId)
        .input('companyId', companyId)
        .query('SELECT cantidad FROM portafolio WHERE id_usuario = @userId AND id_empresa = @companyId');
      
      if (portfolioResult.recordset.length === 0 || portfolioResult.recordset[0].cantidad < cantidad) {
        throw new Error('No tiene suficientes acciones para vender');
      }
      
      // Obtener precio actual
      const companyResult = await transaction.request()
        .input('companyId', companyId)
        .query('SELECT precio_actual FROM empresa WHERE id_empresa = @companyId');
      
      const precio_actual = companyResult.recordset[0].precio_actual;
      const totalEarned = precio_actual * cantidad;
      
      // Actualizar wallet (sumar dinero)
      await transaction.request()
        .input('userId', userId)
        .input('amount', totalEarned)
        .query('UPDATE wallet SET saldo = saldo + @amount WHERE id_usuario = @userId');
      
      // Actualizar tesorería (devolver acciones)
      await transaction.request()
        .input('companyId', companyId)
        .input('cantidad', cantidad)
        .query(`
          UPDATE tesoreria SET cantidad = cantidad + @cantidad WHERE id_empresa = @companyId
        `);
      
      // Actualizar portafolio (restar acciones)
      await transaction.request()
        .input('userId', userId)
        .input('companyId', companyId)
        .input('cantidad', cantidad)
        .query(`
          UPDATE portafolio 
          SET cantidad = cantidad - @cantidad 
          WHERE id_usuario = @userId AND id_empresa = @companyId
        `);
      
      // Eliminar posición si queda en cero
      await transaction.request()
        .input('userId', userId)
        .input('companyId', companyId)
        .query(`
          DELETE FROM portafolio 
          WHERE id_usuario = @userId AND id_empresa = @companyId AND cantidad = 0
        `);
      
      // Registrar transacción
      await transaction.request()
        .input('userId', userId)
        .input('companyId', companyId)
        .input('tipo', 'venta')
        .input('cantidad', cantidad)
        .input('precio', precio_actual)
        .input('total', totalEarned)
        .query(`
          INSERT INTO transaccion (id_usuario, id_empresa, tipo, cantidad, precio, total, fecha)
          VALUES (@userId, @companyId, @tipo, @cantidad, @precio, @total, GETDATE())
        `);
      
      await transaction.commit();
      logger.info('Venta exitosa', { userId, companyId, cantidad, totalEarned });
      
      return { 
        success: true, 
        message: 'Venta realizada exitosamente',
        totalEarned,
        sharesSold: cantidad
      };
      
    } catch (error) {
      await transaction.rollback();
      logger.error('Error en venta de acciones', error);
      throw error;
    }
  }

  /**
   * Recarga el wallet respetando límite diario
   */
  async rechargeWallet(userId, amount) {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);
    
    try {
      await transaction.begin();
      
      // Obtener categoría y límite diario
      const userResult = await transaction.request()
        .input('userId', userId)
        .query(`
          SELECT u.id_categoria, c.limite_diario 
          FROM usuario u 
          JOIN categoria c ON u.id_categoria = c.id_categoria 
          WHERE u.id_usuario = @userId
        `);
      
      if (userResult.recordset.length === 0) {
        throw new Error('Usuario no encontrado');
      }
      
      const { id_categoria, limite_diario } = userResult.recordset[0];
      
      // Calcular recargas del día
      const today = new Date().toISOString().split('T')[0];
      const dailyRechargesResult = await transaction.request()
        .input('userId', userId)
        .input('today', today)
        .query(`
          SELECT COALESCE(SUM(monto), 0) as total_hoy 
          FROM recarga 
          WHERE id_usuario = @userId AND CAST(fecha AS DATE) = @today
        `);
      
      const totalHoy = dailyRechargesResult.recordset[0].total_hoy;
      
      if (totalHoy + amount > limite_diario) {
        throw new Error(`Límite diario excedido. Límite: $${limite_diario}, Usado hoy: $${totalHoy}`);
      }
      
      // Actualizar wallet
      await transaction.request()
        .input('userId', userId)
        .input('amount', amount)
        .query('UPDATE wallet SET saldo = saldo + @amount WHERE id_usuario = @userId');
      
      // Registrar recarga
      await transaction.request()
        .input('userId', userId)
        .input('monto', amount)
        .query('INSERT INTO recarga (id_usuario, monto, fecha) VALUES (@userId, @monto, GETDATE())');
      
      await transaction.commit();
      logger.info('Recarga exitosa', { userId, amount });
      
      return { 
        success: true, 
        message: 'Recarga realizada exitosamente',
        newBalance: await this.getWalletBalance(userId),
        dailyLimitUsed: totalHoy + amount,
        dailyLimit: limite_diario
      };
      
    } catch (error) {
      await transaction.rollback();
      logger.error('Error en recarga de wallet', error);
      throw error;
    }
  }

  /**
   * Obtiene información del wallet
   */
  async getWalletInfo(userId) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('userId', userId)
        .query(`
          SELECT w.saldo, u.id_categoria, c.nombre_categoria, c.limite_diario,
            (SELECT COALESCE(SUM(monto), 0) 
             FROM recarga 
             WHERE id_usuario = @userId AND CAST(fecha AS DATE) = CAST(GETDATE() AS DATE)) as consumo_hoy
          FROM wallet w
          JOIN usuario u ON w.id_usuario = u.id_usuario
          JOIN categoria c ON u.id_categoria = c.id_categoria
          WHERE w.id_usuario = @userId
        `);
      
      if (result.recordset.length === 0) {
        throw new Error('Wallet no encontrado');
      }
      
      return result.recordset[0];
    } catch (error) {
      logger.error('Error obteniendo info del wallet', error);
      throw error;
    }
  }

  /**
   * Obtiene el portafolio de un trader
   */
  async getPortfolio(userId) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('userId', userId)
        .query(`
          SELECT 
            p.*, 
            e.nombre as empresa_nombre, 
            e.precio_actual,
            m.nombre as mercado_nombre,
            (p.cantidad * e.precio_actual) as valor_actual,
            (p.cantidad * p.precio_promedio) as costo_total
          FROM portafolio p
          JOIN empresa e ON p.id_empresa = e.id_empresa
          JOIN mercado m ON e.id_mercado = m.id_mercado
          WHERE p.id_usuario = @userId AND e.activo = 1
          ORDER BY valor_actual DESC
        `);
      
      const wallet = await this.getWalletInfo(userId);
      const totalPortfolio = result.recordset.reduce((sum, pos) => sum + (pos.cantidad * pos.precio_actual), 0);
      
      return {
        positions: result.recordset.map(data => new Position(data)),
        wallet: wallet.saldo,
        totalPortfolio,
        totalValue: totalPortfolio + wallet.saldo
      };
      
    } catch (error) {
      logger.error('Error obteniendo portafolio', error);
      throw error;
    }
  }

  /**
   * Liquidación total de posiciones
   */
  async liquidateAll(userId, password) {
    // Primero verificar contraseña (usar auth service)
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);
    
    try {
      await transaction.begin();
      
      // Obtener todas las posiciones
      const positionsResult = await transaction.request()
        .input('userId', userId)
        .query(`
          SELECT p.id_empresa, p.cantidad, e.precio_actual
          FROM portafolio p
          JOIN empresa e ON p.id_empresa = e.id_empresa
          WHERE p.id_usuario = @userId AND e.activo = 1
        `);
      
      let totalLiquidated = 0;
      
      // Vender cada posición
      for (const position of positionsResult.recordset) {
        const { id_empresa, cantidad, precio_actual } = position;
        const amount = cantidad * precio_actual;
        
        // Actualizar tesorería
        await transaction.request()
          .input('companyId', id_empresa)
          .input('cantidad', cantidad)
          .query('UPDATE tesoreria SET cantidad = cantidad + @cantidad WHERE id_empresa = @companyId');
        
        // Registrar transacción de venta
        await transaction.request()
          .input('userId', userId)
          .input('companyId', id_empresa)
          .input('tipo', 'venta')
          .input('cantidad', cantidad)
          .input('precio', precio_actual)
          .input('total', amount)
          .query(`
            INSERT INTO transaccion (id_usuario, id_empresa, tipo, cantidad, precio, total, fecha)
            VALUES (@userId, @companyId, @tipo, @cantidad, @precio, @total, GETDATE())
          `);
        
        totalLiquidated += amount;
      }
      
      // Actualizar wallet
      await transaction.request()
        .input('userId', userId)
        .input('amount', totalLiquidated)
        .query('UPDATE wallet SET saldo = saldo + @amount WHERE id_usuario = @userId');
      
      // Eliminar todas las posiciones
      await transaction.request()
        .input('userId', userId)
        .query('DELETE FROM portafolio WHERE id_usuario = @userId');
      
      // Registrar evento de auditoría
      await transaction.request()
        .input('userId', userId)
        .input('accion', 'liquidacion_total')
        .input('detalles', `Liquidación total por $${totalLiquidated}`)
        .query(`
          INSERT INTO auditoria (id_usuario, accion, detalles, fecha)
          VALUES (@userId, @accion, @detalles, GETDATE())
        `);
      
      await transaction.commit();
      logger.info('Liquidación total exitosa', { userId, totalLiquidated });
      
      return { 
        success: true, 
        message: 'Liquidación total completada',
        totalLiquidated,
        positionsLiquidated: positionsResult.recordset.length
      };
      
    } catch (error) {
      await transaction.rollback();
      logger.error('Error en liquidación total', error);
      throw error;
    }
  }

  /**
   * Obtiene datos para la página de inicio del trader
   */
  async getHomeData(userId) {
    try {
      const pool = await getConnection();
      
      // Top 5 empresas por capitalización en mercados habilitados
      const topCompaniesResult = await pool.request()
        .query(`
          SELECT TOP 5 
            e.id_empresa, e.nombre, e.precio_actual, e.cantidad_acciones,
            m.nombre as mercado_nombre,
            (e.precio_actual * e.cantidad_acciones) as capitalizacion,
            (SELECT TOP 1 precio FROM precio_historico WHERE id_empresa = e.id_empresa ORDER BY fecha DESC) as precio_anterior
          FROM empresa e
          JOIN mercado m ON e.id_mercado = m.id_mercado
          WHERE e.activo = 1 AND m.activo = 1
          ORDER BY capitalizacion DESC
        `);
      
      // Información del wallet del usuario
      const walletInfo = await this.getWalletInfo(userId);
      
      return {
        topCompanies: topCompaniesResult.recordset,
        wallet: walletInfo,
        lastUpdate: new Date()
      };
      
    } catch (error) {
      logger.error('Error obteniendo datos de inicio', error);
      throw error;
    }
  }

  /**
   * Obtiene detalle de una empresa
   */
  async getCompanyDetail(companyId) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('companyId', companyId)
        .query(`
          SELECT 
            e.*, 
            m.nombre as mercado_nombre,
            (e.precio_actual * e.cantidad_acciones) as capitalizacion,
            t.cantidad as acciones_disponibles,
            (SELECT TOP 1 u.alias FROM portafolio p 
             JOIN usuario u ON p.id_usuario = u.id_usuario 
             WHERE p.id_empresa = e.id_empresa 
             ORDER BY p.cantidad DESC) as mayor_tenedor
          FROM empresa e
          JOIN mercado m ON e.id_mercado = m.id_mercado
          LEFT JOIN tesoreria t ON e.id_empresa = t.id_empresa
          WHERE e.id_empresa = @companyId AND e.activo = 1
        `);
      
      if (result.recordset.length === 0) {
        throw new Error('Empresa no encontrada');
      }
      
      return result.recordset[0];
    } catch (error) {
      logger.error('Error obteniendo detalle de empresa', error);
      throw error;
    }
  }

  /**
   * Obtiene histórico de precios
   */
  async getPriceHistory(companyId) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('companyId', companyId)
        .query(`
          SELECT precio, fecha
          FROM precio_historico
          WHERE id_empresa = @companyId
          ORDER BY fecha DESC
        `);
      
      return result.recordset;
    } catch (error) {
      logger.error('Error obteniendo histórico de precios', error);
      throw error;
    }
  }

  /**
   * Calcula máximo comprable
   */
  async getMaxBuyable(userId, companyId) {
    try {
      const pool = await getConnection();
      
      // Obtener saldo y precio
      const [walletResult, companyResult, treasuryResult] = await Promise.all([
        pool.request().input('userId', userId).query('SELECT saldo FROM wallet WHERE id_usuario = @userId'),
        pool.request().input('companyId', companyId).query('SELECT precio_actual FROM empresa WHERE id_empresa = @companyId'),
        pool.request().input('companyId', companyId).query('SELECT cantidad FROM tesoreria WHERE id_empresa = @companyId')
      ]);
      
      const saldo = walletResult.recordset[0]?.saldo || 0;
      const precio = companyResult.recordset[0]?.precio_actual || 0;
      const disponibles = treasuryResult.recordset[0]?.cantidad || 0;
      
      if (precio === 0) return 0;
      
      const maxByBalance = Math.floor(saldo / precio);
      return Math.min(maxByBalance, disponibles);
      
    } catch (error) {
      logger.error('Error calculando máximo comprable', error);
      throw error;
    }
  }

  /**
   * Obtiene balance del wallet
   */
  async getWalletBalance(userId) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('userId', userId)
        .query('SELECT saldo FROM wallet WHERE id_usuario = @userId');
      
      return result.recordset[0]?.saldo || 0;
    } catch (error) {
      logger.error('Error obteniendo balance', error);
      throw error;
    }
  }

  /**
   * Obtiene historial de transacciones
   */
  async getTransactionHistory(userId) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('userId', userId)
        .query(`
          SELECT t.*, e.nombre as empresa_nombre
          FROM transaccion t
          JOIN empresa e ON t.id_empresa = e.id_empresa
          WHERE t.id_usuario = @userId
          ORDER BY t.fecha DESC
        `);
      
      return result.recordset.map(data => new Trade(data));
    } catch (error) {
      logger.error('Error obteniendo historial', error);
      throw error;
    }
  }
}