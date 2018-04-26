'use strict';

/**
 * Module dependencies
 */
var messagesPolicy = require('../policies/messages.server.policy'),
  messages = require('../controllers/messages.server.controller');

module.exports = function(app) {
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
