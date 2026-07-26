import { io, Socket } from 'socket.io-client';

let socket: Socket | undefined;

export const getSocket = () => {
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || '';
    socket = io(socketUrl, {
      autoConnect: false,
      withCredentials: true,
    });
  }
  return socket;
};
