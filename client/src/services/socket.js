import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    this.socket = io(import.meta.env.VITE_API_URL, {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  }

  onProblemUpdate(callback) {
    this.socket?.on('problem-updated', callback);
  }

  onNewComment(callback) {
    this.socket?.on('new-comment', callback);
  }

  disconnect() {
    this.socket?.disconnect();
  }
}

export default new SocketService();