'use strict';

/**
 * Module dependencies
 */
var workdatesPolicy = require('../policies/workdates.server.policy'),
  workdates = require('../controllers/workdates.server.controller'),
  workdates_admin = require('../controllers/workdates-admin.server.controller');

module.exports = function (app) {
  // Workdates Routes
  app.route('/api/workdates').all(workdatesPolicy.isAllowed)
    .get(workdates.list)
    .post(workdates.create);

  app.route('/api/workdates/:workdateId').all(workdatesPolicy.isAllowed)
    .get(workdates.read)
    .put(workdates.update)
    .delete(workdates.delete);

  app.route('/api/workdates/:workdateId/comment').post(workdates.comment);
  // Finish by binding the Workdate middleware
  app.param('workdateId', workdates.workdateByID);
};
