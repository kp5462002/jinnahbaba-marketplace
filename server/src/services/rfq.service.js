import prisma from '../utils/prisma.js';

// ─── Create RFQ (buyer) ─────────────────────────────────────────────
export async function createRFQ(buyerId, data) {
  const { title, description, categoryId, quantity, unit, targetPrice, currency, deliveryDate, destination } = data;

  const rfq = await prisma.rFQ.create({
    data: {
      buyerId,
      title,
      description,
      categoryId: categoryId || null,
      quantity,
      unit: unit || 'piece',
      targetPrice: targetPrice || null,
      currency: currency || 'USD',
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      destination: destination || null,
      status: 'OPEN',
    },
  });

  return rfq;
}

// ─── List RFQs (public, filterable) ─────────────────────────────────
export async function listRFQs(query) {
  const {
    page = 1,
    limit = 20,
    status,
    categoryId,
    buyerId,
    search,
  } = query;

  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 20;

  const where = {};
  if (status) where.status = status;
  if (categoryId) where.categoryId = categoryId;
  if (buyerId) where.buyerId = buyerId;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [rfqs, total] = await Promise.all([
    prisma.rFQ.findMany({
      where,
      include: {
        buyer: {
          select: {
            id: true,
            contactName: true,
            companyName: true,
            country: true,
          },
        },
        _count: { select: { responses: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.rFQ.count({ where }),
  ]);

  return {
    rfqs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

// ─── Get RFQ by ID ──────────────────────────────────────────────────
export async function getRFQById(id) {
  const rfq = await prisma.rFQ.findUnique({
    where: { id },
    include: {
      buyer: {
        select: {
          id: true,
          contactName: true,
          companyName: true,
          country: true,
          email: true,
        },
      },
      responses: {
        include: {
          supplier: {
            select: {
              id: true,
              companyName: true,
              country: true,
              isVerified: true,
              rating: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!rfq) {
    const err = new Error('RFQ not found');
    err.status = 404;
    throw err;
  }

  return rfq;
}

// ─── Update RFQ (buyer only) ────────────────────────────────────────
export async function updateRFQ(id, userId, role, data) {
  const rfq = await prisma.rFQ.findUnique({ where: { id } });
  if (!rfq) {
    const err = new Error('RFQ not found');
    err.status = 404;
    throw err;
  }

  if (rfq.buyerId !== userId && role !== 'ADMIN') {
    const err = new Error('Not authorized to update this RFQ');
    err.status = 403;
    throw err;
  }

  return prisma.rFQ.update({
    where: { id },
    data,
  });
}

// ─── Delete RFQ (buyer only) ────────────────────────────────────────
export async function deleteRFQ(id, userId, role) {
  const rfq = await prisma.rFQ.findUnique({ where: { id } });
  if (!rfq) {
    const err = new Error('RFQ not found');
    err.status = 404;
    throw err;
  }

  if (rfq.buyerId !== userId && role !== 'ADMIN') {
    const err = new Error('Not authorized to delete this RFQ');
    err.status = 403;
    throw err;
  }

  await prisma.rFQ.delete({ where: { id } });
  return { message: 'RFQ deleted' };
}

// ─── Respond to RFQ (supplier) ──────────────────────────────────────
export async function respondToRFQ(rfqId, supplierId, data) {
  const rfq = await prisma.rFQ.findUnique({ where: { id: rfqId } });
  if (!rfq) {
    const err = new Error('RFQ not found');
    err.status = 404;
    throw err;
  }

  if (rfq.status !== 'OPEN') {
    const err = new Error('This RFQ is no longer accepting responses');
    err.status = 400;
    throw err;
  }

  const existing = await prisma.rFQResponse.findFirst({
    where: { rfqId, supplierId },
  });
  if (existing) {
    const err = new Error('You have already responded to this RFQ');
    err.status = 409;
    throw err;
  }

  const response = await prisma.rFQResponse.create({
    data: {
      rfqId,
      supplierId,
      unitPrice: data.unitPrice,
      currency: data.currency || 'USD',
      minOrderQty: data.minOrderQty,
      leadTimeDays: data.leadTimeDays,
      message: data.message || null,
      status: 'PENDING',
    },
    include: {
      supplier: {
        select: {
          id: true,
          companyName: true,
          country: true,
          isVerified: true,
          rating: true,
        },
      },
    },
  });

  return response;
}
