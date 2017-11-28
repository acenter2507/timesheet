'use strict';

const _ = require('underscore');
// Create the chat configuration
module.exports = function (io, socket) {
  socket.on('init', function (req) {
    var onlineUser = _.findWhere(global.onlineUsers, { socket: socket.id });
    if (!onlineUser) {
      console.log('Has user connection from: ' + req.user);
      global.onlineUsers.push({ socket: socket.id, user: req.user });
      console.log(global.onlineUsers);
    }
  });

  // Emit the status event when a socket client is disconnected
  socket.on('disconnect', function () {
    var onlineUser = _.findWhere(global.onlineUsers, { socket: socket.id });
    if (onlineUser) {
      console.log('Has user disconnection from: ' + onlineUser.user);
      global.onlineUsers = _.without(global.onlineUsers, onlineUser);
      console.log(global.onlineUsers);
    }
  });
};
