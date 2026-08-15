import { io } from 'socket.io-client';

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      autoConnect: true,
    });
  }
  return socket;
};

export const connectSocket = () => {
  return getSocket().connect();
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};
