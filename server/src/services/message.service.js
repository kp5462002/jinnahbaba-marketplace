import prisma from '../utils/prisma.js';
import { emitToOrder, emitToUser } from '../utils/socket.js';

// ─── Check user is a participant in the order ──────────────────────
async function assertParticipant(orderId, userId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { buyerId: true, supplierId: true, orderNumber: true },
  });
  if (!order) {
    const err = new Error('Order not found'); err.status = 404; throw err;
  }
  if (order.buyerId !== userId && order.supplierId !== userId) {
    const err = new Error('Not a participant in this order'); err.status = 403; throw err;
  }
  return order;
}

// ─── Send a message ─────────────────────────────────────────────────
export async function sendMessage(orderId, senderId, content) {
  if (!content || !content.trim()) {
    const err = new Error('Message content required'); err.status = 400; throw err;
  }

  const order = await assertParticipant(orderId, senderId);

  const message = await prisma.message.create({
    data: {
      orderId,
      senderId,
      content: content.trim(),
    },
    include: {
      sender: { select: { id: true, companyName: true, contactName: true, role: true } },
    },
  });

  // Emit to everyone in the order room (including sender for confirmation)
  emitToOrder(orderId, 'new_message', message);

  // Notify the *other* party (so their navbar badge updates)
  const recipientId = order.buyerId === senderId ? order.supplierId : order.buyerId;
  emitToUser(recipientId, 'message_notification', {
    orderId,
    orderNumber: order.orderNumber,
    message,
  });

  return message;
}

// ─── List messages for an order ─────────────────────────────────────
export async function listMessages(orderId, userId, { markRead = false } = {}) {
  await assertParticipant(orderId, userId);

  const messages = await prisma.message.findMany({
    where: { orderId },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: { select: { id: true, companyName: true, contactName: true, role: true } },
    },
  });

  // Mark incoming messages as read
  if (markRead) {
    await prisma.message.updateMany({
      where: { orderId, senderId: { not: userId }, isRead: false },
      data: { isRead: true },
    });
  }

  return messages;
}

// ─── Unread count for a user across all their orders ────────────────
export async function getUnreadCount(userId) {
  // Count messages in orders where user is a participant and message not from user and not read
  const count = await prisma.message.count({
    where: {
      isRead: false,
      senderId: { not: userId },
      order: {
        OR: [{ buyerId: userId }, { supplierId: userId }],
      },
    },
  });
  return count;
}
