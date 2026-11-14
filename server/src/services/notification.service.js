import prisma from '../utils/prisma.js';
import { sendEmail, orderConfirmationEmail, newOrderAlertEmail } from '../utils/email.js';

export async function notifyOrderCreated(orderId) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: { select: { id: true, email: true, companyName: true, contactName: true, country: true } },
        supplier: { select: { id: true, email: true, companyName: true, contactName: true, country: true } },
        product: { select: { id: true, title: true, unit: true } },
      },
    });
    if (!order) return;

    Promise.all([
      sendEmail(orderConfirmationEmail({ order, buyer: order.buyer, supplier: order.supplier, product: order.product })),
      sendEmail(newOrderAlertEmail({ order, buyer: order.buyer, supplier: order.supplier, product: order.product })),
    ]).then(r => console.log('[notify] sent:', order.orderNumber, r))
      .catch(err => console.error('[notify] error:', err.message));
  } catch (err) {
    console.error('[notify] fatal:', err.message);
  }
}
