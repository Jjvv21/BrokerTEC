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
    
    // Parsear el ID
    let parsedCompanyId = companyId;
    if (typeof companyId === 'string' && companyId.startsWith('E')) {
      parsedCompanyId = parseInt(companyId.substring(1));
    }
    
    console.log('🛒 Compra - ID parseado:', { original: companyId, parsed: parsedCompanyId, cantidad });
    
    // Obtener precio actual y mercado
    const companyResult = await transaction.request()
      .input('companyId', parsedCompanyId)
      .query('SELECT precio_actual, id_mercado FROM empresa WHERE id_empresa = @companyId AND activo = 1');
    
    if (companyResult.recordset.length === 0) {
      throw new Error('Empresa no disponible');
    }
    
    const { precio_actual, id_mercado } = companyResult.recordset[0];
    const totalCost = precio_actual * cantidad;
    
    console.log('💰 Costo total:', totalCost, 'Precio:', precio_actual);
    
    // Verificar saldo suficiente
    const walletResult = await transaction.request()
      .input('userId', userId)
      .query('SELECT saldo FROM wallet WHERE id_usuario = @userId');
    
    if (walletResult.recordset.length === 0) {
      throw new Error('Wallet no encontrado');
    }
    
    const saldo = walletResult.recordset[0].saldo;
    if (saldo < totalCost) {
      throw new Error(`Saldo insuficiente. Tienes $${saldo}, necesitas $${totalCost}`);
    }
    
    // Verificar acciones disponibles en Tesorería
    const treasuryResult = await transaction.request()
      .input('companyId', parsedCompanyId)
      .query('SELECT acciones_disponibles FROM tesoreria WHERE id_empresa = @companyId');
    
    const availableShares = treasuryResult.recordset[0]?.acciones_disponibles || 0;
    if (availableShares < cantidad) {
      throw new Error(`Solo hay ${availableShares} acciones disponibles`);
    }
    
    // Actualizar wallet (restar dinero)
    await transaction.request()
      .input('userId', userId)
      .input('amount', totalCost)
      .query('UPDATE wallet SET saldo = saldo - @amount WHERE id_usuario = @userId');
    
    // Actualizar tesorería (restar acciones)
    await transaction.request()
      .input('companyId', parsedCompanyId)
      .input('cantidad', cantidad)
      .query('UPDATE tesoreria SET acciones_disponibles = acciones_disponibles - @cantidad WHERE id_empresa = @companyId');
    
    // Verificar si ya tiene posición
    const portfolioCheck = await transaction.request()
      .input('userId', userId)
      .input('companyId', parsedCompanyId)
      .query('SELECT cantidad, costo_promedio FROM portafolio WHERE id_usuario = @userId AND id_empresa = @companyId');
    
    if (portfolioCheck.recordset.length > 0) {
      // Actualizar posición existente
      const current = portfolioCheck.recordset[0];
      const newCantidad = current.cantidad + cantidad;
      const newCostoPromedio = ((current.costo_promedio * current.cantidad) + (precio_actual * cantidad)) / newCantidad;
      
      await transaction.request()
        .input('userId', userId)
        .input('companyId', parsedCompanyId)
        .input('cantidad', newCantidad)
        .input('costo_promedio', newCostoPromedio)
        .query(`
          UPDATE portafolio 
          SET cantidad = @cantidad, costo_promedio = @costo_promedio
          WHERE id_usuario = @userId AND id_empresa = @companyId
        `);
    } else {
      // Insertar nueva posición
      await transaction.request()
        .input('userId', userId)
        .input('companyId', parsedCompanyId)
        .input('id_mercado', id_mercado)
        .input('cantidad', cantidad)
        .input('costo_promedio', precio_actual)
        .query(`
          INSERT INTO portafolio (id_usuario, id_empresa, id_mercado, cantidad, costo_promedio)
          VALUES (@userId, @companyId, @id_mercado, @cantidad, @costo_promedio)
        `);
    }
    
    // Registrar transacción (SIN total)
    await transaction.request()
      .input('userId', userId)
      .input('companyId', parsedCompanyId)
      .input('tipo', 'compra')
      .input('cantidad', cantidad)
      .input('precio', precio_actual)
      .query(`
        INSERT INTO transaccion (id_usuario, id_empresa, tipo, cantidad, precio, fecha)
        VALUES (@userId, @companyId, @tipo, @cantidad, @precio, GETDATE())
      `);
    
    await transaction.commit();
    console.log('✅ Compra exitosa');
    
    return { 
      success: true, 
      message: `Compra exitosa de ${cantidad} acciones por $${totalCost}`,
      totalCost,
      sharesBought: cantidad
    };
    
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error en compra:', error);
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
    
    // Parsear el ID
    let parsedCompanyId = companyId;
    if (typeof companyId === 'string' && companyId.startsWith('E')) {
      parsedCompanyId = parseInt(companyId.substring(1));
    }
    
    console.log('💰 Venta - ID parseado:', { original: companyId, parsed: parsedCompanyId, cantidad });
    
    // Verificar que tiene suficientes acciones
    const portfolioResult = await transaction.request()
      .input('userId', userId)
      .input('companyId', parsedCompanyId)
      .query('SELECT cantidad, costo_promedio FROM portafolio WHERE id_usuario = @userId AND id_empresa = @companyId');
    
    if (portfolioResult.recordset.length === 0) {
      throw new Error('No tienes acciones de esta empresa para vender');
    }
    
    const currentShares = portfolioResult.recordset[0].cantidad;
    if (currentShares < cantidad) {
      throw new Error(`Solo tienes ${currentShares} acciones disponibles para vender`);
    }
    
    // Obtener precio actual
    const companyResult = await transaction.request()
      .input('companyId', parsedCompanyId)
      .query('SELECT precio_actual FROM empresa WHERE id_empresa = @companyId');
    
    const precio_actual = companyResult.recordset[0].precio_actual;
    const totalEarned = precio_actual * cantidad;
    
    console.log('💵 Ganancia total:', totalEarned);
    
    // Actualizar wallet (sumar dinero)
    await transaction.request()
      .input('userId', userId)
      .input('amount', totalEarned)
      .query('UPDATE wallet SET saldo = saldo + @amount WHERE id_usuario = @userId');
    
    // Actualizar tesorería (devolver acciones)
    await transaction.request()
      .input('companyId', parsedCompanyId)
      .input('cantidad', cantidad)
      .query('UPDATE tesoreria SET acciones_disponibles = acciones_disponibles + @cantidad WHERE id_empresa = @companyId');
    
    // Actualizar portafolio (restar acciones)
    const newCantidad = currentShares - cantidad;
    if (newCantidad > 0) {
      await transaction.request()
        .input('userId', userId)
        .input('companyId', parsedCompanyId)
        .input('cantidad', newCantidad)
        .query('UPDATE portafolio SET cantidad = @cantidad WHERE id_usuario = @userId AND id_empresa = @companyId');
    } else {
      // Eliminar posición si queda en cero
      await transaction.request()
        .input('userId', userId)
        .input('companyId', parsedCompanyId)
        .query('DELETE FROM portafolio WHERE id_usuario = @userId AND id_empresa = @companyId');
    }
    
    // Registrar transacción (SIN total)
    await transaction.request()
      .input('userId', userId)
      .input('companyId', parsedCompanyId)
      .input('tipo', 'venta')
      .input('cantidad', cantidad)
      .input('precio', precio_actual)
      .query(`
        INSERT INTO transaccion (id_usuario, id_empresa, tipo, cantidad, precio, fecha)
        VALUES (@userId, @companyId, @tipo, @cantidad, @precio, GETDATE())
      `);
    
    await transaction.commit();
    console.log('✅ Venta exitosa');
    
    return { 
      success: true, 
      message: `Venta exitosa de ${cantidad} acciones por $${totalEarned}`,
      totalEarned,
      sharesSold: cantidad
    };
    
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error en venta:', error);
    throw error;
  }
}
  /**
   * Recarga el wallet respetando límite diario
   */
async rechargeWallet(userId, amount) {
  const pool = await getConnection();
  
  try {
    console.log('🔄 Iniciando recarga para usuario:', userId, 'Monto:', amount);
    
    // 1. Obtener el id_wallet del usuario
    const walletResult = await pool.request()
      .input('userId', userId)
      .query('SELECT id_wallet FROM wallet WHERE id_usuario = @userId');
    
    if (walletResult.recordset.length === 0) {
      throw new Error('Wallet no encontrado');
    }
    
    const walletId = walletResult.recordset[0].id_wallet;
    console.log('✅ Wallet ID encontrado:', walletId);
    
    // 2. Validar límite diario (versión simple)
    const dailyRechargesResult = await pool.request()
      .input('walletId', walletId)
      .query(`
        SELECT COALESCE(SUM(monto), 0) as total_hoy 
        FROM recarga 
        WHERE id_wallet = @walletId AND CAST(fecha AS DATE) = CAST(GETDATE() AS DATE)
      `);
    
    const totalHoy = dailyRechargesResult.recordset[0].total_hoy;
    const limiteDiario = 50000.00; // Temporal - podrías obtenerlo de la categoría
    
    if (totalHoy + amount > limiteDiario) {
      throw new Error(`Límite diario excedido. Límite: $${limiteDiario}, Usado hoy: $${totalHoy}`);
    }
    
    // 3. Actualizar saldo
    await pool.request()
      .input('userId', userId)
      .input('amount', amount)
      .query('UPDATE wallet SET saldo = saldo + @amount WHERE id_usuario = @userId');
    
    // 4. Registrar recarga (CORREGIDO - usa id_wallet)
    await pool.request()
      .input('walletId', walletId)
      .input('monto', amount)
      .query('INSERT INTO recarga (id_wallet, monto, fecha) VALUES (@walletId, @monto, GETDATE())');
    
    // 5. Obtener nuevo saldo
    const newBalanceResult = await pool.request()
      .input('userId', userId)
      .query('SELECT saldo FROM wallet WHERE id_usuario = @userId');
    
    const newBalance = newBalanceResult.recordset[0].saldo;
    
    console.log('✅ Recarga exitosa:', { 
      userId, 
      walletId, 
      amount, 
      newBalance,
      dailyUsed: totalHoy + amount 
    });
    
    return { 
      success: true, 
      message: `Recarga de $${amount} realizada exitosamente`,
      newBalance,
      dailyLimitUsed: totalHoy + amount,
      dailyLimit: limiteDiario
    };
    
  } catch (error) {
    console.error('❌ Error en recarga:', error);
    throw error;
  }
}
  /**
   * Obtiene información del wallet
   */
  /**
 */
async getWalletInfo(userId) {
  try {
    const pool = await getConnection();
    
    // ✅ CONSULTA TEMPORAL SIMPLE - sin joins complejos
    const result = await pool.request()
      .input('userId', userId)
      .query('SELECT saldo FROM wallet WHERE id_usuario = @userId');
    
    if (result.recordset.length === 0) {
      throw new Error('Wallet no encontrado');
    }
    
    // ✅ DATOS TEMPORALES - para que el frontend funcione
    const walletData = {
      saldo: result.recordset[0].saldo,
      nombre_categoria: 'Mid', // Temporal
      limite_diario: 50000.00, // Temporal
      consumo_hoy: 0.00 // Temporal
    };
    
    console.log('✅ Wallet data temporal:', walletData);
    return walletData;
    
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
    
    // ✅ CONSULTA TEMPORAL SIMPLE
    const result = await pool.request()
      .input('userId', userId)
      .query('SELECT * FROM portafolio WHERE id_usuario = @userId');
    
    // ✅ DATOS TEMPORALES - para que el frontend funcione
    const portfolioData = {
      positions: result.recordset.map(item => ({
        id_empresa: item.id_empresa,
        empresa_nombre: `Empresa ${item.id_empresa}`, // Temporal
        mercado_nombre: 'NYSE', // Temporal
        cantidad: item.cantidad,
        costo_promedio: item.costo_promedio,
        precio_actual: 100.00, // Temporal
        valor_actual: item.cantidad * 100.00, // Temporal
        costo_total: item.cantidad * item.costo_promedio
      })),
      wallet: 50000.00, // Temporal
      totalPortfolio: result.recordset.reduce((sum, item) => sum + (item.cantidad * 100.00), 0),
      totalValue: 50000.00 + result.recordset.reduce((sum, item) => sum + (item.cantidad * 100.00), 0)
    };
    
    console.log('✅ Portfolio data temporal:', portfolioData);
    return portfolioData;
    
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

  async getHomeData(userId) {
  try {
    const pool = await getConnection();
    
    const topCompaniesResult = await pool.request()
      .query(`
        SELECT TOP 5 
          e.id_empresa, 
          e.nombre, 
          -- e.simbolo,  ❌ REMOVER
          e.precio_actual, 
          e.cantidad_acciones,
          e.market_cap as capitalizacion,
          m.nombre as mercado_nombre,
          (SELECT TOP 1 precio FROM historico_precio
           WHERE id_empresa = e.id_empresa 
           ORDER BY fecha DESC) as precio_anterior
        FROM empresa e
        JOIN mercado m ON e.id_mercado = m.id_mercado
        WHERE e.activo = 1 AND m.estado = 'habilitado'
        ORDER BY capitalizacion DESC
      `);
    
    // ✅ Agregar simbolo temporal a cada empresa
    const empresasConSimbolo = topCompaniesResult.recordset.map(empresa => ({
      ...empresa,
      simbolo: empresa.nombre.substring(0, 4).toUpperCase() // Temporal
    }));
    
    console.log('✅ Top empresas obtenidas:', empresasConSimbolo);
    
    const walletInfo = await this.getWalletInfo(userId);
    
    return {
      topCompanies: empresasConSimbolo,
      wallet: walletInfo,
      lastUpdate: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error en getHomeData:', error);
    
    const walletInfo = await this.getWalletInfo(userId);
    
    return {
      topCompanies: [
        {
          id_empresa: 1,
          nombre: "Apple Inc.",
          simbolo: "AAPL", // Temporal
          precio_actual: 150.00,
          cantidad_acciones: 1000000,
          capitalizacion: 150000000,
          mercado_nombre: "NASDAQ"
        },
        {
          id_empresa: 2,
          nombre: "Microsoft Corp.",
          simbolo: "MSFT", // Temporal
          precio_actual: 300.00,
          cantidad_acciones: 500000,
          capitalizacion: 150000000,
          mercado_nombre: "NASDAQ"
        }
      ],
      wallet: walletInfo,
      lastUpdate: new Date().toISOString()
    };
  }
}

  async getCompanyDetail(companyId) {
  try {
    const pool = await getConnection();
    
    // ✅ Parsear el ID
    let parsedId = companyId;
    if (typeof companyId === 'string' && companyId.startsWith('E')) {
      parsedId = parseInt(companyId.substring(1));
    }
    
    console.log('🔢 ID parseado:', { original: companyId, parsed: parsedId });
    
    const result = await pool.request()
      .input('companyId', sql.Int, parsedId)
      .query(`
        SELECT 
          e.id_empresa,
          e.nombre,
          -- e.simbolo,  ❌ REMOVER - esta columna no existe
          e.precio_actual,
          e.cantidad_acciones,
          e.market_cap as capitalizacion,
          m.nombre as mercado_nombre,
          t.acciones_disponibles,
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
      throw new Error(`Empresa con ID ${parsedId} no encontrada`);
    }
    
    // ✅ Agregar simbolo temporal basado en el nombre
    const empresaData = result.recordset[0];
    return {
      ...empresaData,
      simbolo: empresaData.nombre.substring(0, 4).toUpperCase() // Temporal
    };
    
  } catch (error) {
    logger.error('Error obteniendo detalle de empresa', error);
    throw error;
  }
}

async getPriceHistory(companyId) {
  try {
    const pool = await getConnection();
    
    // ✅ Mismo parseo para price history
    let parsedId = companyId;
    if (typeof companyId === 'string' && companyId.startsWith('E')) {
      parsedId = parseInt(companyId.substring(1));
    }
    
    const result = await pool.request()
      .input('companyId', sql.Int, parsedId)  // ✅ Usar sql.Int
      .query(`
        SELECT precio, fecha
        FROM historico_precio
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