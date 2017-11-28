'use strict';

/**
 * Module dependencies
 */
var monthsPolicy = require('../policies/months.server.policy'),
  months = require('../controllers/months.server.controller');

module.exports = function(app) {

  // Get all month in year of 1 user
  app.route('/api/months/getMonthsOfYearByUser').post(months.getMonthsOfYearByUser);


  // Months Routes
  app.route('/api/months').all(monthsPolicy.isAllowed)
    .get(months.list)
    .post(months.create);

  app.route('/api/months/:monthId').all(monthsPolicy.isAllowed)
    .get(months.read)
    .put(months.update)
    .delete(months.delete);

  // Finish by binding the Month middleware
  app.param('monthId', months.monthByID);
};
