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
  socket.on('chat', req => {
  });
  socket.on('rooms', req => {
    if (!req.user) return;
    Room.find({ users: req.user }).exec((err, rooms) => {
      if (err) {
        io.sockets.connected[socket.id].emit('rooms', { error: true, message: 'チャットグループを取得できません！' });
      }
      io.sockets.connected[socket.id].emit('rooms', { error: false, rooms: rooms });
    });
  });
  socket.on('onlines', req => {
    var users = _.pluck(global.onlineUsers, 'user');
    User.find({ _id: { $in: users } })
      .select('displayName profileImageURL')
      .exec((err, users) => {
        if (err) {
          io.sockets.connected[socket.id].emit('onlines', { error: true, message: 'オンライン中のデータを取得できません！' });
        }
        io.sockets.connected[socket.id].emit('onlines', { error: false, onlines: users });
      });
  });
};
