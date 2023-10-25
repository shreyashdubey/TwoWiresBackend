const socketio = require('socket.io');
const Message = require('./models/MessageSchema');
const User = require('./models/UserSchema');

module.exports = (server) => {
  const io = socketio(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    
    // Move the room join logic outside the 'create' event listener
    const joinRoom = (roomId) => {
      console.log('User joined room:', roomId);
      socket.join(roomId);
    };
    socket.once('create', joinRoom); // Register the 'create' event
    socket.on('sendMessage', async (messageData) => {
      try {
        const { roomId, text, sender } = messageData;

        // Update or insert the message into the database
        await Message.updateOne(
          { chatId: roomId },
          {
            $addToSet: {
              messages: {
                text: text,
                sender: sender,
                timestamp: new Date(),
              },
            },
          },
          { upsert: true }
        );

        const senderUser = await User.findById(sender).lean();
        const senderUsername = senderUser.username;
        messageData.sender = senderUsername;

        // Emit the message to the room
        socket.broadcast.to(roomId).emit('newMessage', messageData);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};
