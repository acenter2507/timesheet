'use strict';

const _ = require('underscore');
var notifs = require(path.resolve('./modules/notifs/server/controllers/notifs.server.controller'));
// Create the chat configuration
module.exports = function (io, socket) {
  var notifSocket = notifs.notifSocket(io, socket);

  // Send request Rest
  socket.on('request', req => {
    // io.sockets.in(req.pollId).emit('poll_like', req.likeCnt);
    // notifSocket.pollLikeNotif(req);
    console.log(req);
  });
};
