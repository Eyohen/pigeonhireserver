const { Chat } = require('../models');
const socketio = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = socketio(server);

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join_room', (room) => {
      socket.join(room);
      console.log(`User joined room: ${room}`);
    });

    socket.on('leave_room', (room) => {
      socket.leave(room);
      console.log(`User left room: ${room}`);
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
};

const sendMessage = async (req, res) => {
  try {
    const { sender, message, room } = req.body;
    const newMessage = await Chat.create({ sender, message, room });
    
    io.to(room).emit('new_message', newMessage);
    
    return res.status(200).json({ newMessage, msg: "Message sent successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Failed to send message", error });
  }
};

const getMessages = async (req, res) => {
  try {
    const { room } = req.params;
    const messages = await Chat.findAll({ where: { room } });
    return res.json(messages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Failed to get messages", error });
  }
};

module.exports = {
  initializeSocket,
  sendMessage,
  getMessages,
};