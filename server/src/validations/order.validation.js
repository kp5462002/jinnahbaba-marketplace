import { z } from 'zod';

export const createOrderSchema = z.object({
  inquiryId: z.string().min(1, 'Inquiry ID is required'),
  quantity: z.number().int().positive(),
  totalAmount: z.number().positive('Total amount must be positive'),
  shippingAddress: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().optional(),
    postalCode: z.string().min(1),
    country: z.string().length(2, 'Country must be a 2-letter code'),
  }),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'DISPUTED']),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'DISPUTED']).optional(),
  role: z.enum(['buyer', 'supplier']).optional(),
});
