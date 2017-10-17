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
      update: {
        method: 'PUT'
      }
    });
  }

  DepartmentsApi.$inject = ['$http'];
  function DepartmentsApi($http) {
    this.removeUser = (departmentId, userId) => {
      return $http.post('/api/departments/' + departmentId + '/removeUser', { userId: userId }, { ignoreLoadingBar: true });
    };
    return this;
  }
}());
