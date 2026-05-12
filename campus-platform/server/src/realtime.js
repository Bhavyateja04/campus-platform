const { Server } = require("socket.io");

// ─── Constants ────────────────────────────────────────────────────────────────

const CORS_CONFIG = {
  origin:      "*",
  credentials: true,
};

const EVENTS = {
  CONNECTION:     "connection",
  REALTIME_READY: "realtime:ready",
};

// ─── State ────────────────────────────────────────────────────────────────────

let io = null;

// ─── Handlers ─────────────────────────────────────────────────────────────────

const handleConnection = (socket) => {
  socket.emit(EVENTS.REALTIME_READY, {
    connected: true,
    socketId:  socket.id,
  });
};

// ─── Realtime ─────────────────────────────────────────────────────────────────

/**
 * @desc    Initialises the Socket.io server and attaches it to the HTTP server.
 *          Must be called once at application startup before any emitRealtime calls.
 */
const initRealtime = (httpServer) => {
  io = new Server(httpServer, { cors: CORS_CONFIG });
  io.on(EVENTS.CONNECTION, handleConnection);
  return io;
};

/**
 * @desc    Broadcasts an event to all connected Socket.io clients.
 *          Silently no-ops if the server has not been initialised yet.
 */
const emitRealtime = (event, payload) => {
  if (io) io.emit(event, payload);
};

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = { initRealtime, emitRealtime };
