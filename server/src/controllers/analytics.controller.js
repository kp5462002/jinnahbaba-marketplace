import * as analyticsService from '../services/analytics.service.js';

export async function dashboard(req, res, next) {
  try {
    const stats = await analyticsService.getDashboardStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

export async function supplierStats(req, res, next) {
  try {
    const stats = await analyticsService.getSupplierAnalytics(req.user.id);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

export async function buyerStats(req, res, next) {
  try {
    const stats = await analyticsService.getBuyerAnalytics(req.user.id);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}
