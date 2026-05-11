const { Server } = require("socket.io");

let io = null;

function initRealtime(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.emit("realtime:ready", { connected: true, socketId: socket.id });
  });

  return io;
}

function emitRealtime(event, payload) {
  if (io) {
    io.emit(event, payload);
  }
}

module.exports = {
  initRealtime,
  emitRealtime,
};
