'use strict';

/**
 * Module dependencies
 */
var workmonthsPolicy = require('../policies/workmonths.server.policy'),
  workmonths = require('../controllers/workmonths.server.controller');
  workmonths_admin = require('../controllers/workmonths-admin.server.controller');

module.exports = function (app) {
  // Get all month in year of 1 user
  app.route('/api/workmonths/list').post(workmonths.list);
  app.route('/api/workmonths/getHolidayWorking').post(workmonths.getHolidayWorking);

  // Workmonths Routes
  app.route('/api/workmonths').all(workmonthsPolicy.isAllowed)
    .get(workmonths.list)
    .post(workmonths.create);

  app.route('/api/workmonths/:workmonthId').all(workmonthsPolicy.isAllowed)
    .get(workmonths.read)
    .put(workmonths.update)
    .delete(workmonths.delete);

  app.route('/api/workmonths/:workmonthId/request').all(workmonthsPolicy.isAllowed).post(workmonths.request);
  app.route('/api/workmonths/:workmonthId/cancel').all(workmonthsPolicy.isAllowed).post(workmonths.cancel);
  app.route('/api/workmonths/:workmonthId/requestDelete').all(workmonthsPolicy.isAllowed).post(workmonths.requestDelete);

  // ADMIN
  app.route('/api/workmonths/admin/reviews').post(workmonths_admin.reviews);
  app.route('/api/workmonths/admin/:workmonthId/approve').all(workmonthsPolicy.isAllowed).post(workmonths_admin.approve);
  app.route('/api/workmonths/admin/:workmonthId/reject').all(workmonthsPolicy.isAllowed).post(workmonths_admin.reject);

  // Finish by binding the Workmonth middleware
  app.param('workmonthId', workmonths.workmonthByID);
};
