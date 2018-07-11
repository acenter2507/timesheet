(function () {
  'use strict';

  // TODO this should be Users service
  angular
    .module('users.admin')
    .factory('AdminUserApi', AdminUserApi);

  AdminUserApi.$inject = ['$http'];

  function AdminUserApi($http) {
    this.loadUsers = function (condition, page) {
      return $http.post('/api/users/list', { condition: condition, page: page }, { ignoreLoadingBar: true });
    };
    this.changeUserPassword = function (userId, newPassword) {
      return $http.post('/api/users/' + userId + '/resetpass', { newPassword: newPassword }, { ignoreLoadingBar: true });
    };
    this.changeUserRoles = function (userId, newRoles) {
      return $http.post('/api/users/' + userId + '/roles', { newRoles: newRoles }, { ignoreLoadingBar: true });
    };
    this.changeUserDepartment = function (userId, newDepartment) {
      return $http.post('/api/users/' + userId + '/department', { newDepartment: newDepartment }, { ignoreLoadingBar: true });
    };
    this.clearDeletedUsers = function () {
      return $http.get('/api/users/clearDeletedUsers', { ignoreLoadingBar: true });
    };
    this.searchUsers = function (condition) {
      return $http.post('/api/users/search', { condition: condition }, { ignoreLoadingBar: true });
    };
    return this;
  }


  // TODO this should be Users service
  angular
    .module('users.admin')
    .factory('AdminUserService', AdminUserService);

  AdminUserService.$inject = ['$resource'];

  function AdminUserService($resource) {
    return $resource('/api/users/:userId', { userId: '@_id' }, {
      save: { method: 'POST', ignoreLoadingBar: true },
      get: { method: 'GET', ignoreLoadingBar: true },
      update: { method: 'PUT', ignoreLoadingBar: true },
      query: { isArray: true, ignoreLoadingBar: true }
    });
  }
}());
