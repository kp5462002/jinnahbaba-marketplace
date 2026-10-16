import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Upload product images (Supplier or Admin)
router.post(
  '/images',
  authenticate,
  requireRole('SUPPLIER', 'ADMIN'),
  upload.array('images', 10),
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      url: `/uploads/${file.filename}`,
    }));

    res.status(201).json({
      message: `${files.length} file(s) uploaded successfully`,
      files,
    });
  }
);

// Upload single avatar (any authenticated user)
router.post(
  '/avatar',
  authenticate,
  upload.single('avatar'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.status(201).json({
      message: 'Avatar uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`,
      },
    });
  }
);

export default router;
