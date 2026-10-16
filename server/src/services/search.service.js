import prisma from '../utils/prisma.js';

export async function searchProducts(params) {
  const {
    q,
    categoryId,
    supplierId,
    minPrice,
    maxPrice,
    country,
    minOrderQty,
    page = 1,
    limit = 20,
    sortBy = 'relevance',
    sortOrder = 'desc',
  } = params;

  const where = { status: 'ACTIVE' };

  // Full-text search on title and description
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (categoryId) where.categoryId = categoryId;
  if (supplierId) where.supplierId = supplierId;

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.AND = [];
    if (minPrice !== undefined) {
      where.AND.push({ priceMax: { gte: minPrice } });
    }
    if (maxPrice !== undefined) {
      where.AND.push({ priceMin: { lte: maxPrice } });
    }
  }

  // Min order quantity filter
  if (minOrderQty !== undefined) {
    where.minOrderQty = { lte: minOrderQty };
  }

  // Supplier country filter
  if (country) {
    where.supplier = { country: { equals: country, mode: 'insensitive' } };
  }

  // Sorting
  let orderBy = {};
  switch (sortBy) {
    case 'price_asc':
      orderBy = { priceMin: 'asc' };
      break;
    case 'price_desc':
      orderBy = { priceMin: 'desc' };
      break;
    case 'newest':
      orderBy = { createdAt: 'desc' };
      break;
    case 'oldest':
      orderBy = { createdAt: 'asc' };
      break;
    default:
      orderBy = { createdAt: 'desc' };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        supplier: {
          select: {
            id: true,
            companyName: true,
            country: true,
            isVerified: true,
          },
        },
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getFilterOptions() {
  const [categories, countries, priceRange] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      select: { id: true, name: true, slug: true, _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({
      where: { role: 'SUPPLIER', isVerified: true },
      select: { country: true },
      distinct: ['country'],
    }),
    prisma.product.aggregate({
      where: { status: 'ACTIVE' },
      _min: { priceMin: true },
      _max: { priceMax: true },
    }),
  ]);

  return {
    categories,
    countries: countries.map((c) => c.country).filter(Boolean),
    priceRange: {
      min: priceRange._min.priceMin || 0,
      max: priceRange._max.priceMax || 0,
    },
  };
}
