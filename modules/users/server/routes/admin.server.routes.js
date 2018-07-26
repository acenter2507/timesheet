'use strict';

/**
 * Module dependencies.
 */
var adminPolicy = require('../policies/admin.server.policy'),
  admin = require('../controllers/admin.server.controller'),
  accountant = require('../controllers/accountant.server.controller');

module.exports = function (app) {
  require('./users.server.routes.js')(app);

  // システム管理者
  app.route('/api/users')
    .post(adminPolicy.isAllowed, admin.add)
    .get(adminPolicy.isAllowed, admin.list);
  app.route('/api/users/list').post(adminPolicy.isAllowed, admin.list);

  app.route('/api/users/:userId')
    .get(adminPolicy.isAllowed, admin.read)
    .put(adminPolicy.isAllowed, admin.update)
    .delete(adminPolicy.isAllowed, admin.delete);
  app.route('/api/users/:userId/resetpass').post(adminPolicy.isAllowed, admin.resetpass);

  // 経理部
  app.route('/api/users/accountant/list').post(adminPolicy.isAllowed, accountant.list);
  app.route('/api/users/accountant/:userId')
    .get(adminPolicy.isAllowed, accountant.read)
    .put(adminPolicy.isAllowed, accountant.update);
  app.route('/api/users/accountant/:userId/department').post(adminPolicy.isAllowed, accountant.department);

  app.param('userId', admin.userByID);
};
