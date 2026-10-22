import * as orderService from '../services/order.service.js';

export async function create(req, res, next) {
  try {
    const order = await orderService.createOrder(req.user.id, req.body);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const order = await orderService.getOrderById(req.params.id);
    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const result = await orderService.listOrders(
      req.user.id,
      req.user.role.toLowerCase(),
      req.query
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const order = await orderService.updateOrderStatus(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function listMine(req, res, next) {
  try {
    const result = await orderService.listBuyerOrders(req.user.id, req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
