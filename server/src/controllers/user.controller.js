import * as userService from '../services/user.service.js';

export async function list(req, res, next) {
  try {
    const result = await userService.listUsers(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function verify(req, res, next) {
  try {
    const user = await userService.verifyUser(req.params.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function unverify(req, res, next) {
  try {
    const user = await userService.unverifyUser(req.params.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateRole(req, res, next) {
  try {
    const user = await userService.updateUserRole(req.params.id, req.body.role);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await userService.deleteUser(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getPublicProfile(req, res, next) {
  try {
    const supplier = await userService.getPublicSupplierProfile(req.params.id);
    res.json(supplier);
  } catch (err) {
    next(err);
  }
}
