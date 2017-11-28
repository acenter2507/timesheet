'use strict';

/**
 * Module dependencies
 */
var monthsPolicy = require('../policies/months.server.policy'),
  months = require('../controllers/months.server.controller');

module.exports = function(app) {
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
