import * as paymentService from '../services/payment.service.js';

export async function createCheckout(req, res, next) {
  try {
    const result = await paymentService.createCheckoutSession(req.params.orderId, req.user.id);
    res.json(result);
  } catch (err) { next(err); }
}

export async function webhook(req, res, next) {
  try {
    const signature = req.headers['stripe-signature'];
    let event;
    try { event = paymentService.constructEvent(req.body, signature); }
    catch (err) { return res.status(400).send(`Webhook Error: ${err.message}`); }
    await paymentService.handleWebhookEvent(event);
    res.json({ received: true });
  } catch (err) { next(err); }
}
