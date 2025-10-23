import express from 'express';
import * as TraderController from '../controllers/trader.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/buy', verifyJWT, TraderController.buyStock);
router.post('/sell', verifyJWT, TraderController.sellStock);
router.get('/positions/:userId', verifyJWT, TraderController.getPositions);

export default router;
