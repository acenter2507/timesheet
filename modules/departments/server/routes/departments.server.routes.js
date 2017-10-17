'use strict';

/**
 * Module dependencies
 */
var departmentsPolicy = require('../policies/departments.server.policy'),
  departments = require('../controllers/departments.server.controller');

module.exports = function(app) {
  // Departments Routes
  app.route('/api/departments').all(departmentsPolicy.isAllowed)
    .get(departments.list)
    .post(departments.create);
  // Update avatar of deparment
  app.route('/api/departments/avatar').post(departmentsPolicy.isAllowed, departments.avatar);
  // Delete user from department
  app.route('/api/departments/removeUser').post(departmentsPolicy.isAllowed, departments.removeUser);

  app.route('/api/departments/:departmentId').all(departmentsPolicy.isAllowed)
    .get(departments.read)
    .put(departments.update)
    .delete(departments.delete);

  // Finish by binding the Department middleware
  app.param('departmentId', departments.departmentByID);
};
