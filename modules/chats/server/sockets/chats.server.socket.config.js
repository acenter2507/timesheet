'use strict';

const _ = require('underscore');
var path = require('path'),
  mongoose = require('mongoose'),
  Chat = mongoose.model('Chat'),
  Room = mongoose.model('Room'),
  Notif = mongoose.model('Notif'),
  User = mongoose.model('User');

// Create the chat configuration
module.exports = function (io, socket) {
  socket.on('get_user_online', req => {
  });
  socket.on('rest_review', req => { });
};
