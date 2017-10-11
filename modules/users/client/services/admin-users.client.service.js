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
    this.changeUserPassword = (userId, newPassword) => {
      return $http.post('/api/users/' + userId + '/resetpass', { newPassword: newPassword }, { ignoreLoadingBar: true });
    };
    this.changeUserRoles = (userId, newRoles) => {
      return $http.post('/api/users/' + userId + '/roles', { newRoles: newRoles }, { ignoreLoadingBar: true });
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
