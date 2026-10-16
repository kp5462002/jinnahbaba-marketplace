import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/', userController.list);
router.get('/:id', userController.getById);
router.put('/:id/verify', userController.verify);
router.put('/:id/unverify', userController.unverify);
router.put('/:id/role', userController.updateRole);
router.delete('/:id', userController.remove);

export default router;
