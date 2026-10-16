import prisma from '../utils/prisma.js';
import { emitToOrder, emitToUser } from '../utils/socket.js';

export async function createMessage(senderId, data) {
  const order = await prisma.order.findUnique({
    where: { id: data.orderId },
  });

  if (!order) {
    const err = new Error('Order not found');
    err.status = 404;
    throw err;
  }

  // Only buyer or supplier of the order can send messages
  if (order.buyerId !== senderId && order.supplierId !== senderId) {
    const err = new Error('Not authorized to send messages for this order');
    err.status = 403;
    throw err;
  }

  const message = await prisma.message.create({
    data: {
      orderId: data.orderId,
      senderId,
      content: data.content,
    },
    include: {
      sender: { select: { id: true, companyName: true, contactName: true } },
    },
  });

  // Emit real-time event to order participants
  emitToOrder(data.orderId, 'new_message', message);

  // Notify the other participant
  const recipientId = order.buyerId === senderId ? order.supplierId : order.buyerId;
  emitToUser(recipientId, 'new_message_notification', {
    orderId: data.orderId,
    message,
  });

  return message;
}

export async function getMessagesByOrder(orderId, userId, query) {
  const { page = 1, limit = 50 } = query;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    const err = new Error('Order not found');
    err.status = 404;
    throw err;
  }

  // Only buyer or supplier of the order can view messages
  if (order.buyerId !== userId && order.supplierId !== userId) {
    const err = new Error('Not authorized to view messages for this order');
    err.status = 403;
    throw err;
  }

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { orderId },
      include: {
        sender: { select: { id: true, companyName: true, contactName: true } },
      },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.message.count({ where: { orderId } }),
  ]);

  return {
    messages,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function markMessagesAsRead(orderId, userId) {
  await prisma.message.updateMany({
    where: {
      orderId,
      senderId: { not: userId },
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  // Notify sender that messages were read
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { buyerId: true, supplierId: true },
  });

  if (order) {
    const otherPartyId = order.buyerId === userId ? order.supplierId : order.buyerId;
    emitToUser(otherPartyId, 'messages_read', { orderId, readBy: userId });
  }

  return { message: 'Messages marked as read' };
}
