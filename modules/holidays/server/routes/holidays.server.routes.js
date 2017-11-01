'use strict';

/**
 * Module dependencies
 */
var holidaysPolicy = require('../policies/holidays.server.policy'),
  holidays = require('../controllers/holidays.server.controller');

module.exports = function(app) {
  // Holidays Routes
  app.route('/api/holidays').all(holidaysPolicy.isAllowed)
    .get(holidays.list)
    .post(holidays.create);

  app.route('/api/holidays/:holidayId').all(holidaysPolicy.isAllowed)
    .get(holidays.read)
    .put(holidays.update)
    .delete(holidays.delete);

  // Finish by binding the Holiday middleware
  app.param('holidayId', holidays.holidayByID);
};
