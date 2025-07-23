const Message = require('../models/Message');

const chatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a room with user ID
    socket.on('join', (userId) => {
      socket.join(userId);
    });

    // Handle sending message
    socket.on('sendMessage', async ({ senderId, receiverId, message }) => {
      const newMsg = new Message({
        senderId,
        receiverId,
        message,
      });

      await newMsg.save();

      io.to(receiverId).emit('receiveMessage', newMsg);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = chatSocket;