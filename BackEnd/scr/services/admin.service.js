import { getConnection } from '../config/db.js';
import sql from 'mssql';
import { User, Company } from '../models/index.js';
import { logger } from '../config/logger.js';

export class AdminService {
  /**
   * Obtiene todos los usuarios
   */
  async getAllUsers() {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .query(`
          SELECT u.*, r.nombre_rol, c.nombre_categoria
          FROM usuario u
          LEFT JOIN rol r ON u.id_rol = r.id_rol
          LEFT JOIN categoria c ON u.id_categoria = c.id_categoria
        `);
      
      return result.recordset.map(data => new User(data).toJSON());
    } catch (error) {
      logger.error('Error obteniendo usuarios', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las empresas
   */
  async getAllCompanies() {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .query(`
          SELECT e.*, m.nombre as mercado_nombre
          FROM empresa e
          JOIN mercado m ON e.id_mercado = m.id_mercado
        `);
      
      return result.recordset.map(data => new Company(data));
    } catch (error) {
      logger.error('Error obteniendo empresas', error);
      throw error;
    }
  }

  /**
   * Crea una nueva empresa
   */
  async createCompany(companyData) {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);
    
    try {
      await transaction.begin();
      
      const { nombre, id_mercado, cantidad_acciones, precio_actual } = companyData;
      
      // Insertar empresa
      const result = await transaction.request()
        .input('nombre', nombre)
        .input('id_mercado', id_mercado)
        .input('cantidad_acciones', cantidad_acciones)
        .input('precio_actual', precio_actual)
        .query(`
          INSERT INTO empresa (nombre, id_mercado, cantidad_acciones, precio_actual, activo)
          OUTPUT INSERTED.*
          VALUES (@nombre, @id_mercado, @cantidad_acciones, @precio_actual, 1)
        `);
      
      const newCompany = result.recordset[0];
      
      // Registrar precio histórico inicial
      await transaction.request()
        .input('id_empresa', newCompany.id_empresa)
        .input('precio', precio_actual)
        .query(`
          INSERT INTO precio_historico (id_empresa, precio, fecha)
          VALUES (@id_empresa, @precio, GETDATE())
        `);
      
      // Crear inventario en tesorería
      await transaction.request()
        .input('id_empresa', newCompany.id_empresa)
        .input('cantidad', cantidad_acciones)
        .query(`
          INSERT INTO tesoreria (id_empresa, cantidad)
          VALUES (@id_empresa, @cantidad)
        `);
      
      await transaction.commit();
      logger.info('Empresa creada exitosamente', { companyId: newCompany.id_empresa });
      
      return new Company(newCompany);
      
    } catch (error) {
      await transaction.rollback();
      logger.error('Error creando empresa', error);
      throw error;
    }
  }

  /**
   * Actualiza una empresa existente
   */
  async updateCompany(companyId, companyData) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('companyId', companyId)
        .input('nombre', companyData.nombre)
        .input('id_mercado', companyData.id_mercado)
        .input('cantidad_acciones', companyData.cantidad_acciones)
        .query(`
          UPDATE empresa 
          SET nombre = @nombre, id_mercado = @id_mercado, cantidad_acciones = @cantidad_acciones
          WHERE id_empresa = @companyId
        `);
      
      logger.info('Empresa actualizada', { companyId });
      return { success: true, message: 'Empresa actualizada exitosamente' };
      
    } catch (error) {
      logger.error('Error actualizando empresa', error);
      throw error;
    }
  }

  /**
   * Delista una empresa (liquidación automática)
   */
  async delistCompany(companyId, justification) {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);
    
    try {
      await transaction.begin();
      
      // Obtener precio actual para liquidación
      const companyResult = await transaction.request()
        .input('companyId', companyId)
        .query('SELECT precio_actual FROM empresa WHERE id_empresa = @companyId');
      
      if (companyResult.recordset.length === 0) {
        throw new Error('Empresa no encontrada');
      }
      
      const precio_actual = companyResult.recordset[0].precio_actual;
      
      // Obtener todas las posiciones de esta empresa
      const positionsResult = await transaction.request()
        .input('companyId', companyId)
        .query(`
          SELECT p.id_usuario, p.cantidad
          FROM portafolio p
          WHERE p.id_empresa = @companyId
        `);
      
      // Liquidar cada posición
      for (const position of positionsResult.recordset) {
        const { id_usuario, cantidad } = position;
        const totalAmount = cantidad * precio_actual;
        
        // Actualizar wallet del usuario
        await transaction.request()
          .input('userId', id_usuario)
          .input('amount', totalAmount)
          .query('UPDATE wallet SET saldo = saldo + @amount WHERE id_usuario = @userId');
        
        // Registrar transacción de liquidación
        await transaction.request()
          .input('userId', id_usuario)
          .input('companyId', companyId)
          .input('tipo', 'liquidacion')
          .input('cantidad', cantidad)
          .input('precio', precio_actual)
          .input('total', totalAmount)
          .query(`
            INSERT INTO transaccion (id_usuario, id_empresa, tipo, cantidad, precio, total, fecha)
            VALUES (@userId, @companyId, @tipo, @cantidad, @precio, @total, GETDATE())
          `);
      }
      
      // Eliminar todas las posiciones
      await transaction.request()
        .input('companyId', companyId)
        .query('DELETE FROM portafolio WHERE id_empresa = @companyId');
      
      // Desactivar empresa
      await transaction.request()
        .input('companyId', companyId)
        .query('UPDATE empresa SET activo = 0 WHERE id_empresa = @companyId');
      
      // Registrar auditoría
      await transaction.request()
        .input('accion', 'delist_empresa')
        .input('detalles', `Empresa ${companyId} delistada. Justificación: ${justification}`)
        .query(`
          INSERT INTO auditoria (accion, detalles, fecha)
          VALUES (@accion, @detalles, GETDATE())
        `);
      
      await transaction.commit();
      logger.info('Empresa delistada exitosamente', { companyId, positionsLiquidated: positionsResult.recordset.length });
      
      return { 
        success: true, 
        message: 'Empresa delistada y posiciones liquidadas',
        positionsLiquidated: positionsResult.recordset.length
      };
      
    } catch (error) {
      await transaction.rollback();
      logger.error('Error delistando empresa', error);
      throw error;
    }
  }

  /**
   * Actualiza precio de una acción
   */
  async updateStockPrice(companyId, newPrice) {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);
    
    try {
      await transaction.begin();
      
      // Actualizar precio actual
      await transaction.request()
        .input('companyId', companyId)
        .input('newPrice', newPrice)
        .query('UPDATE empresa SET precio_actual = @newPrice WHERE id_empresa = @companyId');
      
      // Registrar en histórico
      await transaction.request()
        .input('companyId', companyId)
        .input('price', newPrice)
        .query(`
          INSERT INTO precio_historico (id_empresa, precio, fecha)
          VALUES (@companyId, @price, GETDATE())
        `);
      
      await transaction.commit();
      logger.info('Precio actualizado', { companyId, newPrice });
      
      return { success: true, message: 'Precio actualizado exitosamente' };
      
    } catch (error) {
      await transaction.rollback();
      logger.error('Error actualizando precio', error);
      throw error;
    }
  }

  /**
   * Deshabilita un usuario (liquidación automática)
   */
  async disableUser(userId, justification) {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);
    
    try {
      await transaction.begin();
      
      // Obtener todas las posiciones del usuario
      const positionsResult = await transaction.request()
        .input('userId', userId)
        .query(`
          SELECT p.id_empresa, p.cantidad, e.precio_actual
          FROM portafolio p
          JOIN empresa e ON p.id_empresa = e.id_empresa
          WHERE p.id_usuario = @userId AND e.activo = 1
        `);
      
      let totalLiquidated = 0;
      
      // Liquidar cada posición
      for (const position of positionsResult.recordset) {
        const { id_empresa, cantidad, precio_actual } = position;
        const totalAmount = cantidad * precio_actual;
        
        // Devolver acciones a tesorería
        await transaction.request()
          .input('companyId', id_empresa)
          .input('cantidad', cantidad)
          .query('UPDATE tesoreria SET cantidad = cantidad + @cantidad WHERE id_empresa = @companyId');
        
        // Registrar transacción
        await transaction.request()
          .input('userId', userId)
          .input('companyId', id_empresa)
          .input('tipo', 'liquidacion')
          .input('cantidad', cantidad)
          .input('precio', precio_actual)
          .input('total', totalAmount)
          .query(`
            INSERT INTO transaccion (id_usuario, id_empresa, tipo, cantidad, precio, total, fecha)
            VALUES (@userId, @companyId, @tipo, @cantidad, @precio, @total, GETDATE())
          `);
        
        totalLiquidated += totalAmount;
      }
      
      // Actualizar wallet
      await transaction.request()
        .input('userId', userId)
        .input('amount', totalLiquidated)
        .query('UPDATE wallet SET saldo = saldo + @amount WHERE id_usuario = @userId');
      
      // Eliminar posiciones
      await transaction.request()
        .input('userId', userId)
        .query('DELETE FROM portafolio WHERE id_usuario = @userId');
      
      // Deshabilitar usuario
      await transaction.request()
        .input('userId', userId)
        .query('UPDATE usuario SET activo = 0 WHERE id_usuario = @userId');
      
      // Registrar auditoría
      await transaction.request()
        .input('userId', userId)
        .input('accion', 'deshabilitar_usuario')
        .input('detalles', `Usuario ${userId} deshabilitado. Justificación: ${justification}. Liquidado: $${totalLiquidated}`)
        .query(`
          INSERT INTO auditoria (id_usuario, accion, detalles, fecha)
          VALUES (@userId, @accion, @detalles, GETDATE())
        `);
      
      await transaction.commit();
      logger.info('Usuario deshabilitado', { userId, totalLiquidated });
      
      return { 
        success: true, 
        message: 'Usuario deshabilitado y posiciones liquidadas',
        totalLiquidated,
        positionsLiquidated: positionsResult.recordset.length
      };
      
    } catch (error) {
      await transaction.rollback();
      logger.error('Error deshabilitando usuario', error);
      throw error;
    }
  }

  /**
   * Asigna categoría a un usuario
   */
  async assignCategory(userId, categoryId) {
    try {
      const pool = await getConnection();
      await pool.request()
        .input('userId', userId)
        .input('categoryId', categoryId)
        .query('UPDATE usuario SET id_categoria = @categoryId WHERE id_usuario = @userId');
      
      logger.info('Categoría asignada', { userId, categoryId });
      return { success: true, message: 'Categoría asignada exitosamente' };
      
    } catch (error) {
      logger.error('Error asignando categoría', error);
      throw error;
    }
  }

  /**
   * Obtiene top traders
   */
  async getTopTraders() {
    try {
      const pool = await getConnection();
      
      // Top por dinero en wallet
      const topByWallet = await pool.request()
        .query(`
          SELECT TOP 5 
            u.alias, u.nombre, w.saldo as valor
          FROM usuario u
          JOIN wallet w ON u.id_usuario = w.id_usuario
          WHERE u.id_rol = 2 AND u.activo = 1
          ORDER BY w.saldo DESC
        `);
      
      // Top por valor en acciones
      const topByPortfolio = await pool.request()
        .query(`
          SELECT TOP 5 
            u.alias, u.nombre,
            SUM(p.cantidad * e.precio_actual) as valor
          FROM usuario u
          JOIN portafolio p ON u.id_usuario = p.id_usuario
          JOIN empresa e ON p.id_empresa = e.id_empresa
          WHERE u.id_rol = 2 AND u.activo = 1 AND e.activo = 1
          GROUP BY u.id_usuario, u.alias, u.nombre
          ORDER BY valor DESC
        `);
      
      return {
        byWallet: topByWallet.recordset,
        byPortfolio: topByPortfolio.recordset
      };
      
    } catch (error) {
      logger.error('Error obteniendo top traders', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo mercado
   */
  async createMarket(marketData) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('nombre', marketData.nombre)
        .input('descripcion', marketData.descripcion)
        .query(`
          INSERT INTO mercado (nombre, descripcion, activo)
          OUTPUT INSERTED.*
          VALUES (@nombre, @descripcion, 1)
        `);
      
      logger.info('Mercado creado', { marketId: result.recordset[0].id_mercado });
      return result.recordset[0];
      
    } catch (error) {
      logger.error('Error creando mercado', error);
      throw error;
    }
  }

  /**
   * Actualiza un mercado
   */
  async updateMarket(marketId, marketData) {
    try {
      const pool = await getConnection();
      await pool.request()
        .input('marketId', marketId)
        .input('nombre', marketData.nombre)
        .input('descripcion', marketData.descripcion)
        .query(`
          UPDATE mercado 
          SET nombre = @nombre, descripcion = @descripcion 
          WHERE id_mercado = @marketId
        `);
      
      logger.info('Mercado actualizado', { marketId });
      return { success: true, message: 'Mercado actualizado exitosamente' };
      
    } catch (error) {
      logger.error('Error actualizando mercado', error);
      throw error;
    }
  }

  /**
   * Elimina un mercado
   */
  async deleteMarket(marketId) {
    try {
      const pool = await getConnection();
      
      // Verificar que no hay empresas asociadas
      const companiesResult = await pool.request()
        .input('marketId', marketId)
        .query('SELECT COUNT(*) as count FROM empresa WHERE id_mercado = @marketId AND activo = 1');
      
      if (companiesResult.recordset[0].count > 0) {
        throw new Error('No se puede eliminar un mercado con empresas activas');
      }
      
      await pool.request()
        .input('marketId', marketId)
        .query('DELETE FROM mercado WHERE id_mercado = @marketId');
      
      logger.info('Mercado eliminado', { marketId });
      return { success: true, message: 'Mercado eliminado exitosamente' };
      
    } catch (error) {
      logger.error('Error eliminando mercado', error);
      throw error;
    }
  }
}