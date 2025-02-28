const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let onlineUsers = [];

app.use(express.static('public')); // Serve the static files like the HTML file

io.on('connection', (socket) => {
  // New user connected
  socket.on('user-connected', (data) => {
    onlineUsers.push(data.username);
    io.emit('online-users', onlineUsers);
  });

  // Message from a user
  socket.on('send-message', (message) => {
    io.emit('message', message);  // Broadcast to all users
  });

  // Private message
  socket.on('send-private-message', (data) => {
    const { user, message } = data;
    io.to(user).emit('message', `Private message: ${message}`);
  });

  // Handle ICE candidates for WebRTC
  socket.on('send-ice-candidate', (candidate) => {
    socket.broadcast.emit('receive-ice-candidate', candidate);
  });

  // Handle offer and answer for WebRTC
  socket.on('send-offer', (offer) => {
    socket.broadcast.emit('receive-offer', offer);
  });

  socket.on('send-answer', (answer) => {
    socket.broadcast.emit('receive-answer', answer);
  });

  // User disconnected
  socket.on('disconnect', () => {
    onlineUsers = onlineUsers.filter(user => user !== socket.id);
    io.emit('online-users', onlineUsers);
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
