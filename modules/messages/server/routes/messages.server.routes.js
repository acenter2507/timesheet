'use strict';

/**
 * Module dependencies
 */
var messagesPolicy = require('../policies/messages.server.policy'),
  messages = require('../controllers/messages.server.controller');

module.exports = function (app) {
  app.route('/api/messages/count').all(messagesPolicy.isAllowed).get(messages.count);
  app.route('/api/messages/clear').all(messagesPolicy.isAllowed).get(messages.clear);
  app.route('/api/messages/load').all(messagesPolicy.isAllowed).post(messages.load);
  app.route('/api/messages/:messageId/remove').all(messagesPolicy.isAllowed).get(messages.delete);
  app.route('/api/messages/:messageId/open').all(messagesPolicy.isAllowed).get(messages.open);
  // Messages Routes
  app.route('/api/messages').all(messagesPolicy.isAllowed)
    .get(messages.list)
    .post(messages.create);

  app.route('/api/messages/:messageId').all(messagesPolicy.isAllowed)
    .get(messages.read)
    .put(messages.update)
    .delete(messages.delete);


  // Finish by binding the Message middleware
  app.param('messageId', messages.messageByID);
};
