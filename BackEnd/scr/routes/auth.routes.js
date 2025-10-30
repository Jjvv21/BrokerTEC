import { Router } from 'express';
import { login, register, verifyToken } from '../controllers/auth.controller.js';
import { validateUser } from '../middlewares/validate.middleware.js';

const router = Router();

router.post('/login', login);
router.post('/register', validateUser, register);
router.get('/verify', verifyToken);

export default router;