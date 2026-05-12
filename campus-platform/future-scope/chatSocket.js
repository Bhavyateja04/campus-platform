module.exports = (io) => {
  io.on("connection", (socket) => {

    socket.on("joinChat", (roomId) => {
      socket.join(roomId);
    });

    socket.on("sendMessage", (data) => {
      io.to(data.roomId).emit("receiveMessage", data);
    });

  });
};