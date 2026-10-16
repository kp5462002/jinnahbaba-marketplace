import http from 'http';
import express from 'express';
import app from './app.js';
import { env } from './config/env.js';
import { initSocket } from './utils/socket.js';

const PORT = env.PORT;

// Create HTTP server
const httpServer = http.createServer(app);

// Initialize Socket.io
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log(`WebSocket ready for connections`);
});
