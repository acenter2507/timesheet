'use strict';

/**
 * Module dependencies.
 */
var adminPolicy = require('../policies/admin.server.policy'),
  admin = require('../controllers/admin.server.controller');

module.exports = function (app) {
  // User route registration first. Ref: #713
  require('./users.server.routes.js')(app);

  // Users collection routes
  app.route('/api/users')
    .post(adminPolicy.isAllowed, admin.add)
    .get(adminPolicy.isAllowed, admin.list);
  // Tìm kiếm user với key và list ignore
  app.route('/api/users/search').post(admin.searchUsers);

  // Single user routes
  app.route('/api/users/:userId')
    .get(adminPolicy.isAllowed, admin.read)
    .put(adminPolicy.isAllowed, admin.update)
    .delete(adminPolicy.isAllowed, admin.delete);

  app.route('/api/users/:userId/resetpass').post(adminPolicy.isAllowed, admin.changeUserPassword);
  app.route('/api/users/:userId/roles').post(adminPolicy.isAllowed, admin.changeUserRoles);

  // Finish by binding the user middleware
  app.param('userId', admin.userByID);
};
