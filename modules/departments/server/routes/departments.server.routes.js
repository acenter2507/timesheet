'use strict';

/**
 * Module dependencies
 */
var departmentsPolicy = require('../policies/departments.server.policy'),
  departments = require('../controllers/departments.server.controller'),
  manager = require('../controllers/departments-manager.server.controller');

module.exports = function (app) {
  // マネージャー
  app.route('/api/departments/manager/avatar').post(departmentsPolicy.isAllowed, manager.avatar);
  app.route('/api/departments/manager').all(departmentsPolicy.isAllowed)
    .get(manager.list)
    .post(manager.create);

  app.route('/api/departments/manager/:departmentId').all(departmentsPolicy.isAllowed)
    .get(manager.read)
    .put(manager.update)
    .delete(manager.delete);
  app.route('/api/departments/manager/:departmentId/user').all(departmentsPolicy.isAllowed)
    .post(manager.removeMember)
    .put(manager.addMember);

  app.route('/api/departments/autocomplete').all(departmentsPolicy.isAllowed).post(departments.autocomplete);
  app.route('/api/departments').all(departmentsPolicy.isAllowed).get(departments.list);
  app.route('/api/departments/:departmentId').all(departmentsPolicy.isAllowed).get(departments.read);
  app.param('departmentId', departments.departmentByID);
};
