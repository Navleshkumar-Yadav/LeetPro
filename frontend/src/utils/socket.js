import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_BACKEND_URL, {
      withCredentials: true,
      autoConnect: false,
    });
  }
  return socket;
}

/** Connect (or reconnect) with the current user id. Avoids waking the API on public pages. */
export function ensureSocketConnected(userId) {
  const s = getSocket();
  const q = userId || '';
  s.io.opts.query = { userId: q };
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect();
}
