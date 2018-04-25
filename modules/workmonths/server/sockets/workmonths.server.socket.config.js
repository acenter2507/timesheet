'use strict';

const _ = require('underscore');
var path = require('path'),
  mongoose = require('mongoose'),
  Workrest = mongoose.model('Workrest'),
  Workmonth = mongoose.model('Workmonth'),
  Notif = mongoose.model('Notif'),
  User = mongoose.model('User');

var notifs = require(path.resolve('./modules/notifs/server/controllers/notifs.server.controller'));

// Create the chat configuration
module.exports = function (io, socket) {
  var notifSocket = notifs.notifSocket(io, socket);
  socket.on('month_request', req => {
  });
  socket.on('month_cancle', req => {
  });
  socket.on('month_accept', req => {
  });
  socket.on('month_reject', req => {
  });
  socket.on('month_comment', req => {
  });
};
