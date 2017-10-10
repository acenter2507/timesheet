(function () {
  'use strict';

  // TODO this should be Users service
  angular
    .module('users.admin')
    .factory('AdminUserApi', AdminUserApi);

  AdminUserApi.$inject = ['$http'];

  function AdminUserApi($http) {
    this.loadAdminUsers = (condition, page) => {
      return $http.post('/api/admins/users', { condition: condition, page: page }, { ignoreLoadingBar: true });
    };
    this.adminCreateUser = (user) => {
      return $http.post('/api/admins/users/new', { user: user }, { ignoreLoadingBar: true });
    };
    this.searchUsers = (key, ignores, roles) => {
      return $http.post('/api/users/search', { key: key, ignores: ignores, roles: roles }, { ignoreLoadingBar: true });
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
      update: {
        method: 'PUT'
      }
    });
  }
}());
