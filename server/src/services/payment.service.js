import Stripe from 'stripe';
import prisma from '../utils/prisma.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const SUCCESS_URL = process.env.STRIPE_SUCCESS_URL || 'http://localhost:3000/payments/success';
const CANCEL_URL = process.env.STRIPE_CANCEL_URL || 'http://localhost:3000/payments/cancel';

export async function createCheckoutSession(orderId, buyerId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      product: { select: { title: true } },
      buyer: { select: { id: true, email: true } },
    },
  });
  if (!order) { const e = new Error('Order not found'); e.status = 404; throw e; }
  if (order.buyerId !== buyerId) { const e = new Error('Not your order'); e.status = 403; throw e; }
  if (order.status === 'PAID') { const e = new Error('Already paid'); e.status = 400; throw e; }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: (order.currency || 'usd').toLowerCase(),
        product_data: {
          name: order.product?.title || `Order ${order.orderNumber}`,
          description: `Order ${order.orderNumber} — Qty ${order.quantity}`,
        },
        unit_amount: Math.round(order.unitPrice * 100),
      },
      quantity: order.quantity,
    }],
    customer_email: order.buyer?.email,
    metadata: { orderId: order.id, orderNumber: order.orderNumber },
    success_url: `${SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${CANCEL_URL}?orderId=${order.id}`,
  });

  await prisma.payment.upsert({
    where: { orderId: order.id },
    create: {
      orderId: order.id,
      stripeSessionId: session.id,
      amount: order.totalAmount,
      currency: order.currency || 'USD',
      status: 'pending',
    },
    update: { stripeSessionId: session.id, status: 'pending' },
  });

  return { url: session.url, sessionId: session.id };
}

export async function handleWebhookEvent(event) {
  const session = event.data.object;
  const orderId = session?.metadata?.orderId;
  if (!orderId) return;

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    await prisma.$transaction([
      prisma.payment.update({
        where: { orderId },
        data: { status: 'paid', stripePaymentId: session.payment_intent, paidAt: new Date() },
      }),
      prisma.order.update({ where: { id: orderId }, data: { status: 'PAID' } }),
    ]);
  }

  if (event.type === 'checkout.session.async_payment_failed') {
    await prisma.payment.update({ where: { orderId }, data: { status: 'failed' } });
  }
}

export function constructEvent(rawBody, signature) {
  return stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
}
