// Departments service used to communicate Departments REST endpoints
(function () {
  'use strict';

  angular
    .module('departments')
    .factory('DepartmentsService', DepartmentsService);

  DepartmentsService.$inject = ['$resource'];

  function DepartmentsService($resource) {
    return $resource('api/departments/:departmentId', {
      departmentId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
