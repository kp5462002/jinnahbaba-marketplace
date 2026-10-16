import prisma from '../utils/prisma.js';

function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export async function createOrder(buyerId, data) {
  const inquiry = await prisma.inquiry.findUnique({
    where: { id: data.inquiryId },
    include: { product: true },
  });

  if (!inquiry) {
    const err = new Error('Inquiry not found');
    err.status = 404;
    throw err;
  }

  if (inquiry.buyerId !== buyerId) {
    const err = new Error('Not authorized to create order for this inquiry');
    err.status = 403;
    throw err;
  }

  if (inquiry.status !== 'ACCEPTED') {
    const err = new Error('Inquiry must be accepted before creating an order');
    err.status = 400;
    throw err;
  }

  if (inquiry.order) {
    const err = new Error('Order already exists for this inquiry');
    err.status = 400;
    throw err;
  }

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      buyerId,
      supplierId: inquiry.supplierId,
      productId: inquiry.productId,
      inquiryId: inquiry.id,
      quantity: data.quantity,
      totalAmount: data.totalAmount,
      status: 'PENDING',
    },
    include: {
      buyer: { select: { id: true, companyName: true, contactName: true, country: true } },
      supplier: { select: { id: true, companyName: true, contactName: true, country: true } },
      product: { select: { id: true, title: true, images: true, priceMin: true, priceMax: true, unit: true } },
      inquiry: { select: { id: true, message: true, quantity: true } },
    },
  });

  return order;
}

export async function getOrderById(id) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      buyer: { select: { id: true, companyName: true, contactName: true, country: true } },
      supplier: { select: { id: true, companyName: true, contactName: true, country: true } },
      product: { select: { id: true, title: true, images: true, priceMin: true, priceMax: true, unit: true } },
      inquiry: { select: { id: true, message: true, quantity: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          sender: { select: { id: true, companyName: true, contactName: true } },
        },
      },
    },
  });

  if (!order) {
    const err = new Error('Order not found');
    err.status = 404;
    throw err;
  }

  return order;
}

export async function listOrders(userId, role, query) {
  const { page = 1, limit = 20, status } = query;

  const where = {};

  if (role === 'buyer') {
    where.buyerId = userId;
  } else if (role === 'supplier') {
    where.supplierId = userId;
  }

  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        buyer: { select: { id: true, companyName: true, contactName: true, country: true } },
        supplier: { select: { id: true, companyName: true, contactName: true, country: true } },
        product: { select: { id: true, title: true, images: true, priceMin: true, priceMax: true, unit: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function updateOrderStatus(id, userId, role, data) {
  const order = await prisma.order.findUnique({ where: { id } });

  if (!order) {
    const err = new Error('Order not found');
    err.status = 404;
    throw err;
  }

  // Only supplier or admin can update status
  if (order.supplierId !== userId && role !== 'ADMIN') {
    const err = new Error('Not authorized to update this order');
    err.status = 403;
    throw err;
  }

  // Validate status transitions
  const validTransitions = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED', 'DISPUTED'],
    DELIVERED: ['DISPUTED'],
    CANCELLED: [],
    DISPUTED: [],
  };

  const allowed = validTransitions[order.status] || [];
  if (!allowed.includes(data.status)) {
    const err = new Error(`Cannot transition from ${order.status} to ${data.status}`);
    err.status = 400;
    throw err;
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: data.status,
      ...(data.trackingNumber && { trackingNumber: data.trackingNumber }),
      ...(data.notes && { notes: data.notes }),
    },
    include: {
      buyer: { select: { id: true, companyName: true, contactName: true, country: true } },
      supplier: { select: { id: true, companyName: true, contactName: true, country: true } },
      product: { select: { id: true, title: true, images: true, priceMin: true, priceMax: true, unit: true } },
    },
  });

  return updated;
}
