'use strict';

/**
 * Module dependencies
 */
var chatsPolicy = require('../policies/chats.server.policy'),
  chats = require('../controllers/chats.server.controller');

module.exports = function(app) {
  // Chats Routes
  app.route('/api/chats').all(chatsPolicy.isAllowed)
    .get(chats.list)
    .post(chats.create);

  app.route('/api/chats/:chatId').all(chatsPolicy.isAllowed)
    .get(chats.read)
    .put(chats.update)
    .delete(chats.delete);

  // Finish by binding the Chat middleware
  app.param('chatId', chats.chatByID);
};
