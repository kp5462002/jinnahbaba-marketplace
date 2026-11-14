import { Resend } from 'resend';

let resend = null;
function getClient() {
  if (!resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      console.warn('[email] RESEND_API_KEY not set — emails disabled');
      return null;
    }
    resend = new Resend(key);
  }
  return resend;
}

const FROM = process.env.RESEND_FROM_EMAIL || 'Jinnah Baba <onboarding@resend.dev>';

export async function sendEmail({ to, subject, html, replyTo }) {
  const client = getClient();
  if (!client) return { skipped: true };

  try {
    const result = await client.emails.send({
      from: FROM,
      to,
      subject,
      html,
      ...(replyTo && { reply_to: replyTo }),
    });
    return { ok: true, id: result.id };
  } catch (err) {
    console.error('[email] send failed:', err.message);
    return { ok: false, error: err.message };
  }
}

export function orderConfirmationEmail({ order, buyer, supplier, product }) {
  const orderUrl = `https://jinnahbaba.com/orders/${order.id}`;
  return {
    to: buyer.email,
    subject: `Order Confirmed — ${order.orderNumber}`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1f2937;">
        <h1 style="color: #00A651; margin-bottom: 8px;">Order Confirmed</h1>
        <p style="font-size: 14px; color: #6b7280; margin-bottom: 24px;">Thank you for your order. Your supplier has been notified.</p>
        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Order Number</div>
          <div style="font-size: 20px; font-weight: 700; color: #111827;">${order.orderNumber}</div>
        </div>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Product</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${product.title}</td></tr>
          <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Quantity</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${order.quantity} ${product.unit}</td></tr>
          <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Supplier</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${supplier.companyName || 'Supplier'}</td></tr>
          <tr><td style="padding: 12px 0; font-size: 16px; font-weight: 700;">Total</td><td style="padding: 12px 0; text-align: right; font-size: 16px; font-weight: 700; color: #00A651;">$${order.totalAmount.toFixed(2)} ${order.currency}</td></tr>
        </table>
        <a href="${orderUrl}" style="display: inline-block; background: #00A651; color: white; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: 700; margin-top: 24px;">View Order</a>
        <p style="font-size: 12px; color: #9ca3af; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px;">Jinnah Baba — B2B Marketplace</p>
      </div>
    `,
    replyTo: supplier.email,
  };
}

export function newOrderAlertEmail({ order, buyer, supplier, product }) {
  const orderUrl = `https://jinnahbaba.com/orders/${order.id}`;
  return {
    to: supplier.email,
    subject: `New Order — ${order.orderNumber} — ${product.title}`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1f2937;">
        <h1 style="color: #00A651; margin-bottom: 8px;">New Order Received</h1>
        <p style="font-size: 14px; color: #6b7280; margin-bottom: 24px;">A buyer has placed an order. Please confirm or cancel within 24 hours.</p>
        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Order Number</div>
          <div style="font-size: 20px; font-weight: 700; color: #111827;">${order.orderNumber}</div>
        </div>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Buyer</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${buyer.companyName || buyer.contactName} (${buyer.country})</td></tr>
          <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Product</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${product.title}</td></tr>
          <tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Quantity</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${order.quantity} ${product.unit}</td></tr>
          <tr><td style="padding: 12px 0; font-size: 16px; font-weight: 700;">Total</td><td style="padding: 12px 0; text-align: right; font-size: 16px; font-weight: 700; color: #00A651;">$${order.totalAmount.toFixed(2)} ${order.currency}</td></tr>
        </table>
        <a href="${orderUrl}" style="display: inline-block; background: #00A651; color: white; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: 700; margin-top: 24px;">View & Confirm Order</a>
      </div>
    `,
    replyTo: buyer.email,
  };
}
