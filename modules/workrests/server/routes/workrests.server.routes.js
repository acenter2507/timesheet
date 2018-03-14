'use strict';

/**
 * Module dependencies
 */
var workrestsPolicy = require('../policies/workrests.server.policy'),
  workrests = require('../controllers/workrests.server.controller');

module.exports = function(app) {
  // Workrests Routes
  app.route('/api/workrests').all(workrestsPolicy.isAllowed)
    .get(workrests.list)
    .post(workrests.create);

  app.route('/api/workrests/:workrestId').all(workrestsPolicy.isAllowed)
    .get(workrests.read)
    .put(workrests.update)
    .delete(workrests.delete);

  // Finish by binding the Workrest middleware
  app.param('workrestId', workrests.workrestByID);
};
