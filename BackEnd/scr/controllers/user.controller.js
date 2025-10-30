// scr/controllers/user.controller.js
import { UserService } from '../services/user.service.js';

export const getUserProfile = async (req, res) => {
  try {
    console.log('👤 [UserController] getUserProfile llamado');
    console.log('🔑 [UserController] req.user:', req.user);
    
    const userId = req.user.userId;
    console.log('📋 [UserController] userId extraído:', userId);
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    console.log('🔄 [UserController] Llamando a UserService...');
    
    // ✅ Crear instancia del servicio
    const userService = new UserService();
    const result = await userService.getUserProfile(userId);
    
    console.log('✅ [UserController] Resultado exitoso:', result);
    res.status(200).json(result);
  } catch (err) {
    console.error('❌ [UserController] Error:', err);
    res.status(400).json({ error: err.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userData = req.body;
    
    const userService = new UserService();
    const result = await userService.updateUserProfile(userId, userData);
    
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;
    
    const userService = new UserService();
    const result = await userService.changePassword(userId, currentPassword, newPassword);
    
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};