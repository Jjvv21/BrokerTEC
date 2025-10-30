import { Router } from 'express';
import { 
  getUserProfile, 
  updateUserProfile, 
  changePassword 
} from '../controllers/user.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { validateUser } from '../middlewares/validate.middleware.js';
import { getConnection } from "../config/db.js";



const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

router.get('/profile', getUserProfile);
router.put('/profile', validateUser, updateUserProfile);
router.put('/password', changePassword);

router.get("/traders", authenticateToken, async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT id_usuario, alias, nombre
      FROM usuario
      WHERE id_rol = 2 AND estado = 1
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error obteniendo traders:", error);
    res.status(500).json({ message: "Error al obtener los traders" });
  }
});


export default router;