import { Router } from 'express';
import * as cartController from '../controllers/cart.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();

// All cart routes require BUYER authentication
router.use(authenticate, requireRole('BUYER', 'ADMIN'));

router.get('/', cartController.getCart);
router.post('/add', cartController.addItem);
router.delete('/item/:itemId', cartController.removeItem);

export default router;
