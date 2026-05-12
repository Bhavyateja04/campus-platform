module.exports = (io) => {

  io.on("connection", (socket) => {

    console.log("User connected");

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
    });

    socket.on("sendMessage", (data) => {
      io.to(data.roomId).emit("receiveMessage", data);
    });

  });

};
