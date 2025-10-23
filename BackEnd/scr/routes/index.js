import express from 'express';
import traderRoutes from './trader.routes.js';
import adminRoutes from './admin.routes.js';
import authRoutes from './auth.routes.js';
import analystRoutes from './analyst.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/trader', traderRoutes);
router.use('/admin', adminRoutes);
router.use('/analyst', analystRoutes);

export default router;
