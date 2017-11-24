'use strict';

/**
 * Module dependencies
 */
var restsPolicy = require('../policies/rests.server.policy'),
  rests = require('../controllers/rests.server.controller');

module.exports = function (app) {
  // Rests Routes
  app.route('/api/rests/owner').post(rests.getRestOfCurrentUser);
  app.route('/api/rests/review').post(rests.getRestReview);

  app.route('/api/rests').all(restsPolicy.isAllowed)
    .get(rests.list)
    .post(rests.create);

  app.route('/api/rests/:restId').all(restsPolicy.isAllowed)
    .get(rests.read)
    .put(rests.update)
    .delete(rests.delete);
  app.route('/api/rests/:restId/request').all(restsPolicy.isAllowed).post(rests.request);
  app.route('/api/rests/:restId/approve').all(restsPolicy.isAllowed).post(rests.approve);
  app.route('/api/rests/:restId/reject').all(restsPolicy.isAllowed).post(rests.reject);
  // Finish by binding the Rest middleware
  app.param('restId', rests.restByID);
};
