import prisma from '../utils/prisma.js';

export async function createInquiry(buyerId, data) {
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
  });

  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }

  if (product.supplierId === buyerId) {
    const err = new Error('Cannot send inquiry to your own product');
    err.status = 400;
    throw err;
  }

  const inquiry = await prisma.inquiry.create({
    data: {
      buyerId,
      productId: data.productId,
      supplierId: product.supplierId,
      message: data.message,
      quantity: data.quantity,
    },
    include: {
      buyer: { select: { id: true, companyName: true, contactName: true, country: true } },
      product: { select: { id: true, title: true, images: true, priceMin: true, priceMax: true, unit: true } },
    },
  });

  return inquiry;
}

export async function getInquiryById(id) {
  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    include: {
      buyer: { select: { id: true, companyName: true, contactName: true, country: true } },
      supplier: { select: { id: true, companyName: true, contactName: true, country: true } },
      product: { select: { id: true, title: true, images: true, priceMin: true, priceMax: true, unit: true } },
      order: { select: { id: true, orderNumber: true, status: true } },
    },
  });

  if (!inquiry) {
    const err = new Error('Inquiry not found');
    err.status = 404;
    throw err;
  }

  return inquiry;
}

export async function listInquiries(userId, role, query) {
  const { page = 1, limit = 20, status } = query;

  const where = {};

  if (role === 'buyer') {
    where.buyerId = userId;
  } else if (role === 'supplier') {
    where.supplierId = userId;
  }

  if (status) where.status = status;

  const [inquiries, total] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      include: {
        buyer: { select: { id: true, companyName: true, contactName: true, country: true } },
        product: { select: { id: true, title: true, images: true, priceMin: true, priceMax: true, unit: true } },
        order: { select: { id: true, orderNumber: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.inquiry.count({ where }),
  ]);

  return {
    inquiries,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function updateInquiryStatus(id, supplierId, role, newStatus) {
  const inquiry = await prisma.inquiry.findUnique({ where: { id } });

  if (!inquiry) {
    const err = new Error('Inquiry not found');
    err.status = 404;
    throw err;
  }

  if (inquiry.supplierId !== supplierId && role !== 'ADMIN') {
    const err = new Error('Not authorized to update this inquiry');
    err.status = 403;
    throw err;
  }

  if (inquiry.status !== 'PENDING') {
    const err = new Error(`Cannot update inquiry with status: ${inquiry.status}`);
    err.status = 400;
    throw err;
  }

  const updated = await prisma.inquiry.update({
    where: { id },
    data: { status: newStatus },
    include: {
      buyer: { select: { id: true, companyName: true, contactName: true, country: true } },
      product: { select: { id: true, title: true, images: true, priceMin: true, priceMax: true, unit: true } },
    },
  });

  return updated;
}
