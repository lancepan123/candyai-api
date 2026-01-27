import { Server } from 'socket.io';
import { FastifyInstance } from 'fastify';

let io: Server;

export const initSocket = (server: any, app: FastifyInstance) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Configure this properly in production
    }
  });

  io.on('connection', (socket) => {
    app.log.info(`Socket connected: ${socket.id}`);
    
    socket.on('disconnect', () => {
      app.log.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
