// ============================================================================
// Socket.IO Client
// ============================================================================
// WebSocket connection manager for real-time communication
// ============================================================================

import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config';

// ============================================================================
// Constants
// ============================================================================

const SOCKET_CONFIG = {
  transports: ['websocket'],
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
};

// ============================================================================
// Socket Instance
// ============================================================================

let socket = null;

/**
 * Gets or creates a Socket.IO connection
 * @returns {Socket} Socket.IO client instance
 */
export function getSocket() {
  if (!socket) {
    socket = io(API_BASE_URL, SOCKET_CONFIG);
    setupSocketListeners();
  }
  return socket;
}

/**
 * Disconnects the Socket.IO connection
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Checks if socket is connected
 * @returns {boolean} Connection status
 */
export function isSocketConnected() {
  return socket?.connected || false;
}

// ============================================================================
// Socket Event Listeners
// ============================================================================

/**
 * Sets up default socket event listeners
 */
function setupSocketListeners() {
  if (!socket) return;

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
}

// ============================================================================
// Socket Event Emitters
// ============================================================================

/**
 * Emits an event to the server
 * @param {string} event - Event name
 * @param {any} data - Event data
 * @param {Function} callback - Optional callback function
 */
export function emit(event, data, callback) {
  const sock = getSocket();
  if (callback) {
    sock.emit(event, data, callback);
  } else {
    sock.emit(event, data);
  }
}

/**
 * Listens for an event from the server
 * @param {string} event - Event name
 * @param {Function} handler - Event handler function
 * @returns {Function} Unsubscribe function
 */
export function on(event, handler) {
  const sock = getSocket();
  sock.on(event, handler);

  // Return unsubscribe function
  return () => {
    sock.off(event, handler);
  };
}

/**
 * Listens for a one-time event from the server
 * @param {string} event - Event name
 * @param {Function} handler - Event handler function
 * @returns {Function} Unsubscribe function
 */
export function once(event, handler) {
  const sock = getSocket();
  sock.once(event, handler);

  // Return unsubscribe function
  return () => {
    sock.off(event, handler);
  };
}

/**
 * Removes an event listener
 * @param {string} event - Event name
 * @param {Function} handler - Event handler function
 */
export function off(event, handler) {
  if (socket) {
    socket.off(event, handler);
  }
}

// ============================================================================
// Socket Utility Functions
// ============================================================================

/**
 * Emits an event and waits for a response (acknowledgment)
 * @param {string} event - Event name
 * @param {any} data - Event data
 * @returns {Promise<any>} Server response
 */
export function emitAsync(event, data) {
  return new Promise((resolve, reject) => {
    const sock = getSocket();
    sock.emit(event, data, (response) => {
      if (response?.error) {
        reject(new Error(response.error));
      } else {
        resolve(response);
      }
    });
  });
}

/**
 * Reconnects the socket manually
 */
export function reconnect() {
  if (socket) {
    socket.connect();
  } else {
    getSocket();
  }
}
