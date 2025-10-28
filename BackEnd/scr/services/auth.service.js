import { getConnection } from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { logger } from '../config/logger.js';

export class AuthService {
  /**
   * Autentica un usuario por email y password
   */
  async login(email, password) {
    try {
      logger.info('Intentando login', { email });
      
      const pool = await getConnection();
      const result = await pool.request()
        .input('email', email)
        .query('SELECT * FROM usuario WHERE correo = @email');
      
      if (result.recordset.length === 0) {
        throw new Error('Usuario no encontrado');
      }
      
      const userData = result.recordset[0];
      
      // ❌ PROBLEMA 1: La columna se llama password_hash, no contrasena_hash
      // ❌ PROBLEMA 2: Los passwords están en texto plano, no hasheados
      
      // ✅ SOLUCIÓN TEMPORAL: Comparar con texto plano
      if (password !== userData.password_hash) {
        throw new Error('Contraseña incorrecta');
      }
      
      const user = new User(userData);
      
      // ✅ CORREGIR: userId y roleId (no role)
      const token = jwt.sign(
        { userId: user.id, roleId: user.rolId }, 
        process.env.JWT_SECRET || 'brokertec_secret_key', 
        { expiresIn: '24h' }
      );
      
      logger.info('Login exitoso', { userId: user.id, alias: user.alias });
      return { user: user.toJSON(), token };
      
    } catch (error) {
      logger.error('Error en login', error);
      throw error;
    }
  }

  /**
   * Registra un nuevo usuario
   */
  async register(userData) {
    try {
      const { nombre, alias, correo, contrasena, direccion, pais, telefono, id_rol = 2, id_categoria = 1 } = userData;
      
      // Verificar si el email o alias ya existen
      const pool = await getConnection();
      const existingUser = await pool.request()
        .input('correo', correo)
        .input('alias', alias)
        .query('SELECT * FROM usuario WHERE correo = @correo OR alias = @alias');
      
      if (existingUser.recordset.length > 0) {
        throw new Error('El correo o alias ya están en uso');
      }
      
      // ✅ CORREGIR: Usar password_hash (no contrasena_hash)
      const result = await pool.request()
        .input('nombre', nombre)
        .input('alias', alias)
        .input('correo', correo)
        .input('password_hash', contrasena) // ← Texto plano temporal
        .input('direccion', direccion)
        .input('pais', pais)
        .input('telefono', telefono)
        .input('id_rol', id_rol)
        .input('id_categoria', id_categoria)
        .query(`
          INSERT INTO usuario (nombre, alias, correo, password_hash, direccion, pais, telefono, id_rol, id_categoria)
          OUTPUT INSERTED.*
          VALUES (@nombre, @alias, @correo, @password_hash, @direccion, @pais, @telefono, @id_rol, @id_categoria)
        `);
      
      const newUser = new User(result.recordset[0]);
      
      // Crear wallet inicial
      await pool.request()
        .input('id_usuario', newUser.id)
        .query('INSERT INTO wallet (id_usuario, saldo) VALUES (@id_usuario, 0)');
      
      logger.info('Usuario registrado exitosamente', { userId: newUser.id });
      return newUser.toJSON();
      
    } catch (error) {
      logger.error('Error en registro', error);
      throw error;
    }
  }

  /**
   * Verifica token JWT
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const pool = await getConnection();
      const result = await pool.request()
        .input('userId', decoded.userId)
        .query('SELECT * FROM usuario WHERE id_usuario = @userId');
      
      if (result.recordset.length === 0) {
        throw new Error('Usuario no encontrado');
      }
      
      return new User(result.recordset[0]).toJSON();
    } catch (error) {
      logger.error('Error verificando token', error);
      throw new Error('Token inválido');
    }
  }

  /**
   * Obtiene usuario por ID
   */
  async getUserById(userId) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('userId', userId)
        .query('SELECT * FROM usuario WHERE id_usuario = @userId');
      
      if (result.recordset.length === 0) return null;
      
      return new User(result.recordset[0]).toJSON();
    } catch (error) {
      logger.error('Error obteniendo usuario', error);
      throw error;
    }
  }
}