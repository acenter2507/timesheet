'use strict';

const _ = require('underscore');
// Create the chat configuration
module.exports = function (io, socket) {
  socket.on('init', function (req) {
    if (!_.contains(global.onlineUsers, { socket: socket.id })) {
      console.log('Has user connection from: ' + req.user);
      global.onlineUsers.push({ socket: socket.id, user: req.user });
      console.log(global.onlineUsers);
    }
  });

  // Emit the status event when a socket client is disconnected
  socket.on('disconnect', function () {
    if (_.contains(global.onlineUsers, socket.id)) {
      console.log('Has user disconnection from: ' + socket.id);
      global.onlineUsers = _.without(global.onlineUsers, _.findWhere(global.onlineUsers, { socket: socket.id }));
      console.log(global.onlineUsers);
    }
  });
};
