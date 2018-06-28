'use strict';

/**
 * Module dependencies
 */
var chatsPolicy = require('../policies/chats.server.policy'),
  chats = require('../controllers/chats.server.controller'),
  rooms = require('../controllers/rooms.server.controller');

module.exports = function (app) {
  app.route('/api/chats/users').all(chatsPolicy.isAllowed).post(chats.users);
  app.route('/api/chats/load').all(chatsPolicy.isAllowed).post(chats.load);
  // Chats Routes
  app.route('/api/chats').all(chatsPolicy.isAllowed)
    .get(chats.list)
    .post(chats.create);

  app.route('/api/chats/:chatId').all(chatsPolicy.isAllowed)
    .get(chats.read)
    .put(chats.update)
    .delete(chats.delete);

  app.route('/api/rooms/load').all(chatsPolicy.isAllowed).post(rooms.load);
  app.route('/api/rooms/privateRoom').all(chatsPolicy.isAllowed).post(rooms.privateRoom);

  app.route('/api/rooms').all(chatsPolicy.isAllowed)
    .get(rooms.list)
    .post(rooms.create);

  app.route('/api/rooms/:chatId').all(chatsPolicy.isAllowed)
    .get(rooms.read)
    .put(rooms.update)
    .delete(rooms.delete);

  // Finish by binding the Chat middleware
  app.param('chatId', chats.chatByID);
  // Finish by binding the Chat middleware
  app.param('roomId', rooms.roomByID);
};
