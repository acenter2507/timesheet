// Departments service used to communicate Departments REST endpoints
(function () {
  'use strict';

  angular
    .module('departments')
    .factory('DepartmentsService', DepartmentsService)
    .factory('DepartmentsApi', DepartmentsApi);

  DepartmentsService.$inject = ['$resource'];
  function DepartmentsService($resource) {
    return $resource('api/departments/:departmentId', { departmentId: '@_id' }, {
      get: { method: 'GET', ignoreLoadingBar: true },
      query: { isArray: true, ignoreLoadingBar: true }
    });
  }

  DepartmentsApi.$inject = ['$http'];
  function DepartmentsApi($http) {
    return this;
  }
}());
