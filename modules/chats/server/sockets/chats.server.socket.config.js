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
    // TODO
    // Đang gửi cho toàn bộ user
    io.sockets.emit('chat', req);
  });
  socket.on('rooms', req => {
    if (!req.user) return;
    Room.paginate({ users: req.user }, {
      page: req.paginate.page,
      limit: req.paginate.limit,
      sort: '-updated',
      select: 'name avatar'
    }).then(result => {
      io.sockets.connected[socket.id].emit('rooms', { error: false, rooms: result.docs });
    }).catch(err => {
      io.sockets.connected[socket.id].emit('rooms', { error: true, message: 'チャットグループを取得できません！' });
    });
  });
  socket.on('onlines', req => {
    var users = _.pluck(global.onlineUsers, 'user');
    User.paginate({ _id: { $in: users } }, {
      page: req.paginate.page,
      limit: req.paginate.limit,
      sort: '-updated',
      select: 'displayName profileImageURL'
    }).then(result => {
      io.sockets.connected[socket.id].emit('onlines', { error: false, onlines: result.docs });
    }).catch(err => {
      io.sockets.connected[socket.id].emit('onlines', { error: true, message: 'オンライン中のデータを取得できません！' });
    });
  });
  socket.on('verify_private_room', req => {
    var users = req.users;

    Room.findOne({ kind: 1, users: users })
      .select('name avatar')
      .exec((err, room) => {
        if (err) {
          io.sockets.connected[socket.id].emit('verify_private_room');
        } else {
          io.sockets.connected[socket.id].emit('verify_private_room', { room: room });
        }
      });
  });
};
