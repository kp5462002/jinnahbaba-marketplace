import * as rfqService from '../services/rfq.service.js';

export async function create(req, res, next) {
  try {
    const rfq = await rfqService.createRFQ(req.user.id, req.body);
    res.status(201).json(rfq);
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const result = await rfqService.listRFQs(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const rfq = await rfqService.getRFQById(req.params.id);
    res.json(rfq);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const rfq = await rfqService.updateRFQ(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    res.json(rfq);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await rfqService.deleteRFQ(req.params.id, req.user.id, req.user.role);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function respond(req, res, next) {
  try {
    const response = await rfqService.respondToRFQ(
      req.params.id,
      req.user.id,
      req.body
    );
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}
