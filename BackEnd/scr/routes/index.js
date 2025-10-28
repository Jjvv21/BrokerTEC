import { Router } from 'express';
import authRoutes from './auth.routes.js';
import traderRoutes from './trader.routes.js';
import adminRoutes from './admin.routes.js';
import analystRoutes from './analyst.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/trader', traderRoutes);
router.use('/admin', adminRoutes);
router.use('/analyst', analystRoutes);
router.use('/user', userRoutes);

export default router;