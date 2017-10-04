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
