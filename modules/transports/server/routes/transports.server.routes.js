'use strict';

/**
 * Module dependencies
 */
var transportsPolicy = require('../policies/transports.server.policy'),
  transports = require('../controllers/transports.server.controller');

module.exports = function(app) {
  // Transports Routes
  app.route('/api/transports').all(transportsPolicy.isAllowed)
    .get(transports.list)
    .post(transports.create);

  app.route('/api/transports/:transportId').all(transportsPolicy.isAllowed)
    .get(transports.read)
    .put(transports.update)
    .delete(transports.delete);

  // Finish by binding the Transport middleware
  app.param('transportId', transports.transportByID);
};
