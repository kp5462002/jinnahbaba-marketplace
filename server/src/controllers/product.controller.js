import * as productService from '../services/product.service.js';

export async function create(req, res, next) {
  try {
    const product = await productService.createProduct(req.user.id, req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function getBySlug(req, res, next) {
  try {
    const product = await productService.getProductBySlug(req.params.slug);
    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const result = await productService.listProducts(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const product = await productService.updateProduct(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await productService.deleteProduct(req.params.id, req.user.id, req.user.role);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function listBySupplier(req, res, next) {
  try {
    const result = await productService.getProductsBySupplier(req.params.supplierId, req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}