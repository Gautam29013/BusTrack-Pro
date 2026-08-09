import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export function getSocket() {
  if (!socket) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    socket = io(`${SOCKET_URL}/buses`, {
      auth: { token: token || '' },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      // Auto-subscribe to all buses for dashboard
      socket.emit('subscribe-all');
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function subscribeToBus(busId) {
  const s = getSocket();
  s.emit('subscribe', { busId });
}

export function unsubscribeFromBus(busId) {
  const s = getSocket();
  s.emit('unsubscribe', { busId });
}
