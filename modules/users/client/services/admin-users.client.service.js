(function () {
  'use strict';

  // TODO this should be Users service
  angular
    .module('users.admin')
    .factory('AdminUserApi', AdminUserApi);

  AdminUserApi.$inject = ['$http'];

  function AdminUserApi($http) {
    this.list = function (condition, page) {
      return $http.post('/api/users/list', { condition: condition, page: page }, { ignoreLoadingBar: true });
    };
    this.resetpass = function (userId, newPassword) {
      return $http.post('/api/users/' + userId + '/resetpass', { newPassword: newPassword }, { ignoreLoadingBar: true });
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
      remove: { method: 'DELETE', ignoreLoadingBar: true },
      query: { isArray: true, ignoreLoadingBar: true }
    });
  }
}());
