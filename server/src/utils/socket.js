import { Server } from 'socket.io';
import { verifyAccessToken } from './jwt.js';

let io = null;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  // JWT authentication middleware
  io.use((socket, next) => {
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
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;

    // Join personal room for direct notifications
    socket.join(`user:${userId}`);

    // Join order rooms for real-time messaging
    socket.on('join_order', (orderId) => {
      socket.join(`order:${orderId}`);
    });

    socket.on('leave_order', (orderId) => {
      socket.leave(`order:${orderId}`);
    });

    // Handle typing indicators
    socket.on('typing', ({ orderId, isTyping }) => {
      socket.to(`order:${orderId}`).emit('typing', {
        userId,
        isTyping,
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${userId}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

// Emit to all participants of an order
export function emitToOrder(orderId, event, data) {
  getIO().to(`order:${orderId}`).emit(event, data);
}

// Emit to a specific user
export function emitToUser(userId, event, data) {
  getIO().to(`user:${userId}`).emit(event, data);
}
