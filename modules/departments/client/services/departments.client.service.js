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
      save: { method: 'POST', ignoreLoadingBar: true },
      get: { method: 'GET', ignoreLoadingBar: true },
      update: { method: 'PUT', ignoreLoadingBar: true },
      query: { isArray: true, ignoreLoadingBar: true }
    });
  }

  DepartmentsApi.$inject = ['$http'];
  function DepartmentsApi($http) {
    this.removeUser = function (departmentId, userId) {
      return $http.post('/api/departments/' + departmentId + '/removeUser', { userId: userId }, { ignoreLoadingBar: true });
    };
    this.addMemberToDepartment = function (departmentId, userId) {
      return $http.post('/api/departments/' + departmentId + '/addUser', { userId: userId }, { ignoreLoadingBar: true });
    };
    this.search = function (condition) {
      return $http.post('/api/departments/search', { condition: condition }, { ignoreLoadingBar: true });
    };
    return this;
  }
}());
