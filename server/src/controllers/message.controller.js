import * as messageService from '../services/message.service.js';

export async function create(req, res, next) {
  try {
    const message = await messageService.createMessage(req.user.id, req.body);
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
}

export async function listByOrder(req, res, next) {
  try {
    const result = await messageService.getMessagesByOrder(
      req.params.orderId,
      req.user.id,
      req.query
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const result = await messageService.markMessagesAsRead(req.params.orderId, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
