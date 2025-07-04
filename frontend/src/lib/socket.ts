import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io('http://localhost:5000'); // adjust if your backend runs elsewhere
  }
  return socket;
}
