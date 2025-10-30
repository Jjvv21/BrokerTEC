import * as AdminService from '../services/admin.service.js';
import { getConnection } from "../config/db.js";
import sql from "mssql";

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
    const { justificacion, precio_fijo } = req.body;
    const idAdmin = req.user.id; // viene del token

    const pool = await getConnection();
    const result = await pool.request()
      .input("id_empresa", sql.Int, companyId)
      .input("justificacion", sql.VarChar(sql.MAX), justificacion)
      .input("precio_fijo", sql.Decimal(18, 4), precio_fijo || null)
      .input("id_admin", sql.Int, idAdmin)
      .execute("SP_DelistarEmpresa");

    res.status(200).json({ message: result.recordset[0].Mensaje });
  } catch (err) {
    console.error(" Error al delistar empresa:", err);
    res.status(500).json({ message: "Error al delistar empresa." });
  }
};



export const updateStockPrice = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { nuevo_precio } = req.body;

    const pool = await getConnection();
    const result = await pool.request()
      .input("id_empresa", sql.Int, companyId)
      .input("nuevo_precio", sql.Decimal(18, 4), nuevo_precio)
      .execute("SP_ActualizarPrecio");

    res.status(200).json({ message: result.recordset[0].Mensaje });
  } catch (error) {
    console.error("❌ Error al actualizar precio:", error);
    res.status(500).json({ message: "Error al actualizar precio." });
  }
};


export const disableUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { justification } = req.body;
    const adminId = req.user.userId; //  AGREGADO - ID del admin que ejecuta
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
    const pool = await getConnection();
    const topN = req.query.top_n ? parseInt(req.query.top_n) : 5;

    const result = await pool.request()
      .input('top_n', sql.Int, topN)
      .query('SELECT * FROM FN_ObtenerTopTradersPorWallet(@top_n)');

    console.log(" Resultado SQL Top Traders:", result.recordset); //

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error al obtener Top Traders:", error);
    res.status(500).json({ message: "Error al obtener Top Traders" });
  }
};




export const getAllUsers = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT 
        u.id_usuario AS id,
        u.nombre,
        u.alias,
        r.nombre_rol AS rol,
        CASE WHEN u.estado = 1 THEN 'activo' ELSE 'inactivo' END AS estado
      FROM usuario u
      INNER JOIN rol r ON u.id_rol = r.id_rol
      ORDER BY u.id_usuario ASC
    `);
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error(" Error obteniendo usuarios:", err);
    res.status(500).json({ error: "Error obteniendo usuarios" });
  }
};

/**
 * 🔹 Activar o deshabilitar usuario
 * Si está activo → llama SP_DeshabilitarUsuario
 * Si está inactivo → UPDATE usuario SET estado = 1
 */
export const toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  const idAdmin = req.user.userId;
  const pool = await getConnection();

  try {
    const result = await pool
      .request()
      .input("id_usuario", id)
      .query("SELECT estado FROM usuario WHERE id_usuario = @id_usuario");

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // 🔹 La declaramos ANTES de usarla
    const estadoActual = result.recordset[0].estado;
    console.log(" Estado actual en BD:", estadoActual);

    if (Number(estadoActual) === 1) {
      console.log(" Ejecutando SP_DeshabilitarUsuario...");
      await pool
        .request()
        .input("id_usuario", id)
        .input("justificacion", "Deshabilitado por el administrador")
        .input("id_admin", idAdmin)
        .execute("SP_DeshabilitarUsuario");

      console.log(" SP ejecutado correctamente");
      res.json({ message: "Usuario deshabilitado correctamente" });
    } else {
      await pool
        .request()
        .input("id_usuario", id)
        .query("UPDATE usuario SET estado = 1 WHERE id_usuario = @id_usuario");

      res.json({ message: "Usuario activado correctamente" });
    }
  } catch (err) {
    console.error("Error al cambiar estado:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getAllCompanies = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT e.id_empresa, e.nombre, m.nombre AS mercado, 
             e.precio_actual, e.cantidad_acciones AS inventario
      FROM empresa e
      INNER JOIN mercado m ON e.id_mercado = m.id_mercado
      WHERE e.activo = 1;
    `);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error al obtener empresas:", error);
    res.status(500).json({ message: "Error al obtener empresas." });
  }
};
