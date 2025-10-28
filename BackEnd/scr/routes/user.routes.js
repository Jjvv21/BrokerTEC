import { Router } from 'express';
import { 
  getUserProfile, 
  updateUserProfile, 
  changePassword 
} from '../controllers/user.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { validateUser } from '../middlewares/validate.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

router.get('/profile', getUserProfile);
router.put('/profile', validateUser, updateUserProfile);
router.put('/password', changePassword);

export default router;