import { z } from 'zod';

export const createProductSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  shortDesc: z.string().max(300).optional(),

  priceMin: z.number().positive(),
  priceMax: z.number().positive(),
  currency: z.string().length(3).default('USD'),
  unit: z.string().default('piece'),

  minOrderQty: z.number().int().positive().default(1),
  stockQty: z.number().int().nonnegative().default(0),
  leadTimeDays: z.number().int().positive().default(15),
  portOfDispatch: z.string().optional(),
  paymentTerms: z.string().optional(),
  supplyAbility: z.string().optional(),

  categoryId: z.string().min(1),
  tags: z.array(z.string()).default([]),

  images: z.array(z.object({
    url: z.string().url(),
    altText: z.string().optional(),
    isPrimary: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  })).optional(),
}).refine((data) => data.priceMax >= data.priceMin, {
  message: 'priceMax must be >= priceMin',
  path: ['priceMax'],
});

export const updateProductSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  shortDesc: z.string().max(300).optional(),
  priceMin: z.number().positive().optional(),
  priceMax: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  unit: z.string().optional(),
  minOrderQty: z.number().int().positive().optional(),
  stockQty: z.number().int().nonnegative().optional(),
  leadTimeDays: z.number().int().positive().optional(),
  portOfDispatch: z.string().optional(),
  paymentTerms: z.string().optional(),
  supplyAbility: z.string().optional(),
  categoryId: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'PENDING', 'ACTIVE', 'REJECTED', 'ARCHIVED']).optional(),
});

export const productQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  categorySlug: z.string().optional(),
  supplierId: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  status: z.enum(['DRAFT', 'PENDING', 'ACTIVE', 'REJECTED', 'ARCHIVED']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'priceMin', 'priceMax', 'viewCount', 'rating', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
}).passthrough();