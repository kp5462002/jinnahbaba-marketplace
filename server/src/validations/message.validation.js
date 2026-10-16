import { z } from 'zod';

export const createMessageSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  content: z.string().min(1, 'Message cannot be empty').max(5000),
});

export const messageQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});
