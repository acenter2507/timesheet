(function () {
  'use strict';

  angular
    .module('departments.admin')
    .factory('ManagerDepartmentsService', ManagerDepartmentsService)
    .factory('ManagerDepartmentsApi', ManagerDepartmentsApi);

  ManagerDepartmentsService.$inject = ['$resource'];
  function ManagerDepartmentsService($resource) {
    return $resource('api/departments/manager/:departmentId', { departmentId: '@_id' }, {
      save: { method: 'POST', ignoreLoadingBar: true },
      get: { method: 'GET', ignoreLoadingBar: true },
      remove: { method: 'DELETE', ignoreLoadingBar: true },
      update: { method: 'PUT', ignoreLoadingBar: true },
      query: { isArray: true, ignoreLoadingBar: true }
    });
  }

  ManagerDepartmentsApi.$inject = ['$http'];
  function ManagerDepartmentsApi($http) {
    this.removeMember = function (departmentId, user) {
      return $http.post('/api/departments/manager/' + departmentId + '/user', { user: user }, { ignoreLoadingBar: true });
    };
    this.addMember = function (departmentId, users) {
      return $http.put('/api/departments/manager/' + departmentId + '/user', { users: users }, { ignoreLoadingBar: true });
    };
    return this;
  }
}());
