import * as cartService from '../services/cart.service.js';

export async function getCart(req, res, next) {
  try {
    const cart = await cartService.getOrCreateCart(req.user.id);
    res.json(cart);
  } catch (err) {
    next(err);
  }
}

export async function addItem(req, res, next) {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
      return res.status(400).json({ error: 'productId and quantity are required' });
    }
    const cart = await cartService.addToCart(req.user.id, productId, Number(quantity));
    res.json(cart);
  } catch (err) {
    next(err);
  }
}

export async function removeItem(req, res, next) {
  try {
    const cart = await cartService.removeFromCart(req.user.id, req.params.itemId);
    res.json(cart);
  } catch (err) {
    next(err);
  }
}
