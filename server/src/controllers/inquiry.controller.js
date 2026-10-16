import * as inquiryService from '../services/inquiry.service.js';

export async function create(req, res, next) {
  try {
    const inquiry = await inquiryService.createInquiry(req.user.id, req.body);
    res.status(201).json(inquiry);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const inquiry = await inquiryService.getInquiryById(req.params.id);
    res.json(inquiry);
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const result = await inquiryService.listInquiries(
      req.user.id,
      req.query.role || req.user.role.toLowerCase(),
      req.query
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const inquiry = await inquiryService.updateInquiryStatus(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body.status
    );
    res.json(inquiry);
  } catch (err) {
    next(err);
  }
}
