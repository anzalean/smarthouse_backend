import { Server } from 'socket.io';
import { env } from '../utils/env.js';

class WebSocketManager {
  constructor() {
    this.io = null;
    this.eventHandlers = new Map();
    this.connectedClients = new Set();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: env('FRONTEND_URL', 'http://localhost:3000'),
        methods: ['GET', 'POST'],
      },
    });

    this.setupConnectionHandlers();
    console.log('WebSocket server initialized');
    return this.io;
  }

  setupConnectionHandlers() {
    this.io.on('connection', socket => {
      console.log(`Client connected: ${socket.id}`);
      this.connectedClients.add(socket.id);

      // Register all event handlers for this socket
      this.eventHandlers.forEach((handler, event) => {
        socket.on(event, data => handler(socket, data));
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        this.connectedClients.delete(socket.id);
      });
    });
  }

  onEvent(event, handler) {
    this.eventHandlers.set(event, handler);

    // Also register handler for existing connections
    if (this.io) {
      this.io.sockets.sockets.forEach(socket => {
        socket.on(event, data => handler(socket, data));
      });
    }
  }

  emit(event, data) {
    if (!this.io) {
      console.warn(
        'WebSocketManager: Attempted to emit event before initialization'
      );
      return;
    }
    this.io.emit(event, data);
  }

  emitToRoom(room, event, data) {
    if (!this.io) {
      console.warn(
        'WebSocketManager: Attempted to emit event before initialization'
      );
      return;
    }
    this.io.to(room).emit(event, data);
  }

  getConnectedClientsCount() {
    return this.connectedClients.size;
  }
}

export default WebSocketManager;
