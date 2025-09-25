import { io } from 'socket.io-client';

// Get userId from localStorage or Redux (for demo, use localStorage)
const user = JSON.parse(localStorage.getItem('user'));
const userId = user?._id;

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  query: { userId },
  withCredentials: true
});

export default socket; 