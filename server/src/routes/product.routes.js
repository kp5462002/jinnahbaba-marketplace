import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { createProductSchema, updateProductSchema, productQuerySchema } from '../validations/product.validation.js';

const router = Router();

// Public routes
router.get('/', validate(productQuerySchema), productController.list);
router.get('/slug/:slug', productController.getBySlug);
router.get('/:id', productController.getById);
router.get('/supplier/:supplierId', productController.listBySupplier);

// Protected routes (Supplier or Admin)
router.post(
  '/',
  authenticate,
  requireRole('SUPPLIER', 'ADMIN'),
  validate(createProductSchema),
  productController.create
);

router.put(
  '/:id',
  authenticate,
  requireRole('SUPPLIER', 'ADMIN'),
  validate(updateProductSchema),
  productController.update
);

router.delete(
  '/:id',
  authenticate,
  requireRole('SUPPLIER', 'ADMIN'),
  productController.remove
);

export default router;