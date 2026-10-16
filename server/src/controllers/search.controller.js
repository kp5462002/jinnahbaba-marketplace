import * as searchService from '../services/search.service.js';

export async function search(req, res, next) {
  try {
    const result = await searchService.searchProducts(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function filterOptions(req, res, next) {
  try {
    const options = await searchService.getFilterOptions();
    res.json(options);
  } catch (err) {
    next(err);
  }
}
