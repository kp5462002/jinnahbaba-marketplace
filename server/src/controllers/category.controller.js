import * as categoryService from '../services/category.service.js';

export async function create(req, res, next) {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    res.json(category);
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const categories = await categoryService.listCategories();
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    res.json(category);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await categoryService.deleteCategory(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
