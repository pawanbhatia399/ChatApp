const path = require('path');
const http= require ('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors')
const formatMessage = require('./utils/messages.js');
const {userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users.js');

const app = express();
const server  = http.createServer(app);
const io = socketio(server);

// Set Static Folder

app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Personal Bot';

//Run when client connects

io.on('connection', socket => {
socket.on('joinRoom', ({username, room}) => {

    const user = userJoin(socket.id, username, room);
    
    socket.join(user.room);
//Welcome current user
socket.emit('message', formatMessage(botName, 'Welcome To ChatApp !'));

//Broadcast when user connects
socket.broadcast.to(user.room).emit('message', formatMessage(botName, ` ${user.username} has joined chat`));

io.to(user.room).emit('roomUsers', {
    room : user.room,
    users: getRoomUsers(user.room)
});

});

// Sent uSer and Room Info



//Listen for chatMessage

socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg))
});

//Runs when client disconnects

socket.on('disconnect', () => {
const user = userLeave(socket.id);
if (user){
    io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`)
    );

    // Sent uSer and Room Info
io.to(user.room).emit('roomUsers', {
    room : user.room,
    users: getRoomUsers(user.room)
});
}   
});

});

const PORT = 7000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));