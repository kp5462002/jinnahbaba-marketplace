import { Router } from 'express';
import * as messageController from '../controllers/message.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/unread-count', messageController.unreadCount);
router.get('/order/:orderId', messageController.list);
router.post('/order/:orderId', messageController.send);

export default router;
