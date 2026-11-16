import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

let socketInstance = null;
let socketPromise = null;

function getSocket() {
  if (socketInstance?.connected) return Promise.resolve(socketInstance);
  if (socketPromise) return socketPromise;

  const token = localStorage.getItem('accessToken');
  if (!token) return Promise.resolve(null);

  const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/api\/?$/, '') || 'http://localhost:5000';

  socketPromise = new Promise((resolve) => {
    const sock = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
    });
    sock.on('connect', () => { socketInstance = sock; resolve(sock); });
    sock.on('connect_error', (err) => {
      console.warn('[socket] connect_error:', err.message);
      if (err.message?.includes('token') || err.message?.includes('auth')) {
        resolve(null);
      }
    });
    setTimeout(() => resolve(sock), 3000);
  });

  return socketPromise;
}

export function useSocket() {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    getSocket().then((sock) => {
      if (cancelled || !sock) return;
      socketRef.current = sock;
      setConnected(sock.connected);
      const onConnect = () => setConnected(true);
      const onDisconnect = () => setConnected(false);
      sock.on('connect', onConnect);
      sock.on('disconnect', onDisconnect);
    });
    return () => { cancelled = true; };
  }, []);

  return { socket: socketRef.current, connected };
}