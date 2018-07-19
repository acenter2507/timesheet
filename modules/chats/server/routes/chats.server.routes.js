'use strict';

/**
 * Module dependencies
 */
var chatsPolicy = require('../policies/chats.server.policy'),
  chats = require('../controllers/chats.server.controller'),
  groups = require('../controllers/groups.server.controller');

module.exports = function (app) {
  app.route('/api/chats/users').all(chatsPolicy.isAllowed).post(chats.users);
  app.route('/api/chats/load').all(chatsPolicy.isAllowed).post(chats.load);
  // Chats Routes
  app.route('/api/chats').all(chatsPolicy.isAllowed).post(chats.create);

  app.route('/api/chats/:chatId').all(chatsPolicy.isAllowed)
    .get(chats.read)
    .put(chats.update)
    .delete(chats.delete);
  // Finish by binding the Chat middleware
  app.param('chatId', chats.chatByID);

  // ROOM
  app.route('/api/groups/load').all(chatsPolicy.isAllowed).post(groups.load);
  app.route('/api/groups/privateGroup').all(chatsPolicy.isAllowed).post(groups.privateGroup);
  app.route('/api/groups/myGroup').all(chatsPolicy.isAllowed).post(groups.myGroup);

  app.route('/api/groups').all(chatsPolicy.isAllowed).post(groups.create);

  app.route('/api/groups/:groupId').all(chatsPolicy.isAllowed)
    .get(groups.read)
    .put(groups.update)
    .delete(groups.delete);
  // Finish by binding the Chat middleware
  app.param('groupId', groups.groupByID);
};
