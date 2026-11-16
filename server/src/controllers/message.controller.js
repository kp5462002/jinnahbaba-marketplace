import * as messageService from '../services/message.service.js';

export async function list(req, res, next) {
  try {
    const { orderId } = req.params;
    const markRead = req.query.markRead === 'true';
    const messages = await messageService.listMessages(orderId, req.user.id, { markRead });
    res.json({ messages });
  } catch (err) { next(err); }
}

export async function send(req, res, next) {
  try {
    const { orderId } = req.params;
    const { content } = req.body;
    const message = await messageService.sendMessage(orderId, req.user.id, content);
    res.status(201).json({ message });
  } catch (err) { next(err); }
}

export async function unreadCount(req, res, next) {
  try {
    const count = await messageService.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (err) { next(err); }
}
