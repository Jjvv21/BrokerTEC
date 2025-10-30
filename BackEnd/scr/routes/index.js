import { Router } from 'express';
import authRoutes from './auth.routes.js';
import traderRoutes from './trader.routes.js';
import adminRoutes from './admin.routes.js';
import analystRoutes from './analyst.routes.js';
import userRoutes from './user.routes.js';
import employeeRoutes from './empresa.routes.js';
import empresaRoutes from './empresa.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/trader', traderRoutes);
router.use('/admin', adminRoutes);
router.use('/analyst', analystRoutes);
router.use('/user', userRoutes);
router.use('/empresas', employeeRoutes);
router.use('/empresas', empresaRoutes);

export default router;