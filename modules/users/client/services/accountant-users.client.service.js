(function () {
  'use strict';

  angular
    .module('users.admin')
    .factory('AccountantUserApi', AccountantUserApi);

  AccountantUserApi.$inject = ['$http'];

  function AccountantUserApi($http) {
    this.list = function (condition, page) {
      return $http.post('/api/users/accountant/list', { condition: condition, page: page }, { ignoreLoadingBar: true });
    };
    this.department = function (userId, newDepartment) {
      return $http.post('/api/users/accountant/' + userId + '/department', { department: department }, { ignoreLoadingBar: true });
    };
    return this;
  }


  // TODO this should be Users service
  angular
    .module('users.admin')
    .factory('AccountantUserService', AccountantUserService);

  AccountantUserService.$inject = ['$resource'];
  function AccountantUserService($resource) {
    return $resource('/api/users/accountant/:userId', { userId: '@_id' }, {
      get: { method: 'GET', ignoreLoadingBar: true },
      update: { method: 'PUT', ignoreLoadingBar: true }
    });
  }
}());
