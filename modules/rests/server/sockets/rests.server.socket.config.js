'use strict';

const _ = require('underscore');
var path = require('path'),
  mongoose = require('mongoose'),
  Rest = mongoose.model('Rest'),
  Notif = mongoose.model('Notif'),
  User = mongoose.model('User');

var notifs = require(path.resolve('./modules/notifs/server/controllers/notifs.server.controller'));
// Create the chat configuration
module.exports = function (io, socket) {
  var notifSocket = notifs.notifSocket(io, socket);
  // Send request Rest
  socket.on('request', req => {
    Rest.findById(req.restId).exec((err, rest) => {
      if (err) return;
      if (!rest) return;
      if (rest.status !== 2) return;
      User.findById(req.userId).exec((err, user) => {
        if (err) return;
        if (!user) return;
        if (user.roles.length > 1) return;
        // 部署ある
        if (user.department && user.leaders.length > 0) {
          user.leaders.forEach(leader => {
            if (!leader) return;
            Notif.findOne({ to: leader, type: 1, from: user._id })
              .populate('from', 'displayName')
              .exec((err, notif) => {
                if (err) return;
                if (notif) {
                  notif.count += 1;
                  notif.message = notif.displayName + 'さんから休暇リクエスト' + notif.count + '個があります';
                  notif.save().then(_notif => {
                    var socketUser = _.findWhere(global.onlineUsers, { user: leader.toString() });
                    io.sockets.connected[socketUser.socket].emit('notifications');
                  });
                } else {
                  var newNotif = new Notif({
                    from: user._id,
                    to: leader,
                    message: user.displayName + 'さんから休暇リクエストがあります',
                    type: 1,
                    count: 1,
                    state: 'rests.review'
                  });
                  newNotif.save(_notif => {
                    var socketUser = _.findWhere(global.onlineUsers, { user: leader });
                    io.sockets.connected[socketUser.socket].emit('notifications');
                  });
                }
              });
          });
        } else { // 部署なし
          User.find({ status: 1, roles: ['accountant'] }).exec((err, accountants) => {
            if (err) return;
            if (accountants.length === 0) return;
            accountants.forEach(accountant => {
              if (!accountant) return;
              Notif.find({ to: accountant._id, type: 1, from: user._id })
                .populate('from', 'displayName')
                .exec((err, notif) => {
                  if (err) return;
                  if (notif) {
                    notif.count += 1;
                    notif.message = notif.displayName + 'さんから休暇リクエスト' + notif.count + '個があります';
                    notif.save().then(_notif => {
                      var socketUser = _.findWhere(global.onlineUsers, { user: accountant._id.toString() });
                      io.sockets.connected[socketUser.socket].emit('notifications');
                    });
                  } else {
                    var newNotif = new Notif({
                      from: user._id,
                      to: accountant._id.toString(),
                      message: user.displayName + 'さんから休暇リクエストがあります',
                      type: 1,
                      count: 1,
                      state: 'rests.review'
                    });
                    newNotif.save(_notif => {
                      var socketUser = _.findWhere(global.onlineUsers, { user: accountant._id.toString() });
                      io.sockets.connected[socketUser.socket].emit('notifications');
                    });
                  }
                });
            });
          });
        }
      });
    });
    // io.sockets.in(req.pollId).emit('poll_like', req.likeCnt);
    // notifSocket.pollLikeNotif(req);
  });
};
