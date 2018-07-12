'use strict';

/**
 * Module dependencies
 */
var workrestsPolicy = require('../policies/workrests.server.policy'),
  workrests = require('../controllers/workrests.server.controller'),
  workrests_admin = require('../controllers/workrests-admin.server.controller');

module.exports = function(app) {
  // Workrests Routes
  app.route('/api/workrests/owner').post(workrests.getRestOfCurrentUser);
  app.route('/api/workrests/owner_in_range').post(workrests.getRestOfCurrentUserInRange);
  app.route('/api/workrests/today').post(workrests.getWorkrestsToday);

  app.route('/api/workrests').all(workrestsPolicy.isAllowed)
    .get(workrests.list)
    .post(workrests.create);

  app.route('/api/workrests/:workrestId').all(workrestsPolicy.isAllowed)
    .get(workrests.read)
    .put(workrests.update)
    .delete(workrests.delete);

  app.route('/api/workrests/:workrestId/request').all(workrestsPolicy.isAllowed).post(workrests.request);
  app.route('/api/workrests/:workrestId/cancel').all(workrestsPolicy.isAllowed).post(workrests.cancel);
  app.route('/api/workrests/:workrestId/requestDelete').all(workrestsPolicy.isAllowed).post(workrests.requestDelete);

  // ADMIN
  app.route('/api/workrests/admin/reviews').all(workrestsPolicy.isAllowed).post(workrests_admin.reviews);
  app.route('/api/workrests/admin/:workrestId/approve').all(workrestsPolicy.isAllowed).post(workrests_admin.approve);
  app.route('/api/workrests/admin/:paymworkrestIdentId/reject').all(workrestsPolicy.isAllowed).post(workrests_admin.reject);

  // Finish by binding the Workrest middleware
  app.param('workrestId', workrests.workrestByID);
};
