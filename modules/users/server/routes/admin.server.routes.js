'use strict';

/**
 * Module dependencies.
 */
var adminPolicy = require('../policies/admin.server.policy'),
  admin = require('../controllers/admin.server.controller');

module.exports = function (app) {
  require('./users.server.routes.js')(app);

  // Users collection routes
  app.route('/api/users')
    .post(adminPolicy.isAllowed, admin.add)
    .get(adminPolicy.isAllowed, admin.list);

  app.route('/api/users/search').post(users.searchUsers);
  app.route('/api/users/list').post(adminPolicy.isAllowed, admin.list);

  // Single user routes
  app.route('/api/users/:userId')
    .get(adminPolicy.isAllowed, admin.read)
    .put(adminPolicy.isAllowed, admin.update)
    .delete(adminPolicy.isAllowed, admin.delete);

  app.route('/api/users/:userId/resetpass').post(adminPolicy.isAllowed, admin.resetpass);
  app.route('/api/users/:userId/department').post(adminPolicy.isAllowed, admin.changeUserDepartment);

  // Finish by binding the user middleware
  app.param('userId', admin.userByID);
};
