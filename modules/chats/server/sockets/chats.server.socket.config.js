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
  socket.on('rest_request', req => {
  });
  socket.on('rest_review', req => { });
};
