'use strict';

/**
 * Module dependencies
 */
var workmonthsPolicy = require('../policies/workmonths.server.policy'),
  workmonths = require('../controllers/workmonths.server.controller');

module.exports = function (app) {
  // Get all month in year of 1 user
  app.route('/api/workmonths/workmonthsByYearAndUser').post(workmonths.getMonthsOfYearByUser);
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
  app.route('/api/workmonths/:workmonthId/approve').all(workmonthsPolicy.isAllowed).post(workmonths.approve);
  app.route('/api/workmonths/:workmonthId/reject').all(workmonthsPolicy.isAllowed).post(workmonths.reject);

  // Finish by binding the Workmonth middleware
  app.param('workmonthId', workmonths.workmonthByID);
};
