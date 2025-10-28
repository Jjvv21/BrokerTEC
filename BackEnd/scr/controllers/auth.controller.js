import { AuthService } from '../services/auth.service.js';

// Crear instancia de AuthService
const authService = new AuthService();

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

export const register = async (req, res) => {
  try {
    const userData = req.body;
    const result = await authService.register(userData);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    // Usar jwtUtils directamente ya que verifyToken no existe en AuthService
    const { jwtUtils } = await import('../utils/jwt.js');
    const decoded = jwtUtils.verifyToken(token);
    
    // Obtener usuario completo
    const user = await authService.getUserById(decoded.userId);
    
    res.status(200).json({ 
      success: true, 
      user 
    });
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
};