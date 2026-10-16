import { verifyAccessToken } from '../utils/jwt.js';

export function socketAuth(socket, next) {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    const decoded = verifyAccessToken(token);
    socket.user = { id: decoded.sub, role: decoded.role };
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
}
