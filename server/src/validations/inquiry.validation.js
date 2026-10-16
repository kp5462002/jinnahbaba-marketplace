import { z } from 'zod';

export const createInquirySchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
  quantity: z.number().int().positive().default(1),
});

export const updateInquiryStatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED', 'EXPIRED']),
});

export const inquiryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED']).optional(),
  role: z.enum(['buyer', 'supplier']).optional(),
});
