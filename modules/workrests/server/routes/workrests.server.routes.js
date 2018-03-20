'use strict';

/**
 * Module dependencies
 */
var workrestsPolicy = require('../policies/workrests.server.policy'),
  workrests = require('../controllers/workrests.server.controller');

module.exports = function(app) {
  // Workrests Routes
  app.route('/api/workrests/owner').post(workrests.getRestOfCurrentUser);
  app.route('/api/workrests/owner_in_range').post(workrests.getRestOfCurrentUserInRange);
  app.route('/api/workrests/review').post(workrests.getRestReview);

  app.route('/api/workrests').all(workrestsPolicy.isAllowed)
    .get(workrests.list)
    .post(workrests.create);

  app.route('/api/workrests/:workrestId').all(workrestsPolicy.isAllowed)
    .get(workrests.read)
    .put(workrests.update)
    .delete(workrests.delete);

    app.route('/api/workrests/:workrestId/request').all(workrestsPolicy.isAllowed).post(workrests.request);
    app.route('/api/workrests/:workrestId/approve').all(workrestsPolicy.isAllowed).post(workrests.approve);
    app.route('/api/workrests/:workrestId/reject').all(workrestsPolicy.isAllowed).post(workrests.reject);

  // Finish by binding the Workrest middleware
  app.param('workrestId', workrests.workrestByID);
};
