import prisma from '../utils/prisma.js';

// BRI region groupings for filtering
const REGIONS = {
  'Africa': ['Nigeria', 'Kenya', 'Egypt', 'South Africa', 'Ethiopia', 'Cameroon', 'Ghana', 'Morocco', 'Tanzania', 'Uganda', 'Algeria', 'Angola', 'Zambia', 'Zimbabwe', 'Mozambique', 'Senegal', 'Mali'],
  'Europe': ['Poland', 'Hungary', 'Greece', 'Serbia', 'Belarus', 'Ukraine', 'Romania', 'Bulgaria', 'Croatia', 'Czech Republic', 'Slovak Republic', 'Slovenia', 'Lithuania', 'Latvia', 'Estonia', 'Italy', 'Portugal', 'Luxembourg', 'Austria', 'Malta', 'Cyprus', 'Montenegro', 'North Macedonia', 'Albania', 'Bosnia and Herzegovina', 'Moldova', 'Turkey'],
  'Central Asia': ['Kazakhstan', 'Uzbekistan', 'Kyrgyz Republic', 'Tajikistan', 'Turkmenistan', 'Mongolia'],
  'Middle East': ['Saudi Arabia', 'UAE', 'Iran', 'Iraq', 'Qatar', 'Kuwait', 'Oman', 'Bahrain', 'Jordan', 'Lebanon', 'Turkey'],
  'South Asia': ['Pakistan', 'India', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Maldives', 'Afghanistan'],
  'Southeast Asia': ['Indonesia', 'Vietnam', 'Thailand', 'Malaysia', 'Philippines', 'Cambodia', 'Laos', 'Myanmar', 'Singapore'],
  'East Asia': ['China', 'Korea, Rep.', 'Japan'],
  'Latin America': ['Chile', 'Costa Rica', 'Guyana', 'Colombia', 'Peru', 'Argentina', 'Brazil', 'Bolivia', 'Ecuador', 'Venezuela, RB', 'Dominican Republic', 'Panama', 'Suriname', 'Uruguay', 'Jamaica', 'Barbados', 'Trinidad and Tobago', 'Cuba', 'El Salvador', 'Honduras', 'Nicaragua', 'Antigua and Barbuda', 'Dominica', 'Grenada'],
};

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function createProduct(supplierId, data) {
  const { images, ...productData } = data;

  let baseSlug = slugify(productData.title);
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const product = await prisma.product.create({
    data: {
      ...productData,
      slug,
      supplierId,
      status: 'PENDING',
      images: images
        ? {
            create: images.map((img, idx) => ({
              url: img.url,
              altText: img.altText || productData.title,
              isPrimary: img.isPrimary ?? idx === 0,
              sortOrder: img.sortOrder ?? idx,
            })),
          }
        : undefined,
    },
    include: {
      supplier: { select: { id: true, companyName: true, country: true, isVerified: true } },
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: 'asc' } },
    },
  });
  return product;
}

export async function getProductById(id) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      supplier: {
        select: {
          id: true, companyName: true, companySlug: true, country: true, city: true,
          isVerified: true, rating: true, reviewCount: true, responseRate: true,
          responseTimeHours: true, yearEstablished: true, businessType: true, logoUrl: true,
        },
      },
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: 'asc' } },
      reviews: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, contactName: true, country: true } } },
      },
    },
  });
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }
  return product;
}

export async function getProductBySlug(slug) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      supplier: {
        select: {
          id: true, companyName: true, companySlug: true, country: true, city: true,
          isVerified: true, rating: true, reviewCount: true, responseRate: true,
          responseTimeHours: true, yearEstablished: true, businessType: true, logoUrl: true,
        },
      },
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: 'asc' } },
      reviews: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, contactName: true, country: true } } },
      },
    },
  });
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }
  return product;
}

export async function listProducts(query) {
  const {
    page = 1,
    limit = 20,
    search,
    categoryId,
    categorySlug,
    supplierId,
    minPrice,
    maxPrice,
    status = 'ACTIVE',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    country,
    region,
  } = query;

  const where = { status };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (categoryId) where.categoryId = categoryId;
  if (categorySlug) where.category = { slug: categorySlug };
  if (supplierId) where.supplierId = supplierId;

  if (country) {
    where.supplier = { ...(where.supplier || {}), country };
  }
  if (region && REGIONS[region]) {
    where.supplier = { ...(where.supplier || {}), country: { in: REGIONS[region] } };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.AND = where.AND || [];
    if (minPrice !== undefined) {
      where.AND.push({ priceMax: { gte: Number(minPrice) } });
    }
    if (maxPrice !== undefined) {
      where.AND.push({ priceMin: { lte: Number(maxPrice) } });
    }
  }

  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 20;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        supplier: { select: { id: true, companyName: true, companySlug: true, country: true, isVerified: true } },
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

export async function updateProduct(id, userId, role, data) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }

  if (product.supplierId !== userId && role !== 'ADMIN') {
    const err = new Error('Not authorized to update this product');
    err.status = 403;
    throw err;
  }

  const updated = await prisma.product.update({
    where: { id },
    data,
    include: {
      supplier: { select: { id: true, companyName: true, country: true } },
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: 'asc' } },
    },
  });
  return updated;
}

export async function deleteProduct(id, userId, role) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }

  if (product.supplierId !== userId && role !== 'ADMIN') {
    const err = new Error('Not authorized to delete this product');
    err.status = 403;
    throw err;
  }

  await prisma.product.delete({ where: { id } });
  return { message: 'Product deleted' };
}

export async function getProductsBySupplier(supplierId, query) {
  const { page = 1, limit = 20, status } = query;
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 20;

  const where = { supplierId };
  if (status) where.status = status;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  };
}
