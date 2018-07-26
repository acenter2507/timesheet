(function () {
  'use strict';

  angular
    .module('users')
    .factory('UserApi', UserApi);

  UserApi.$inject = ['$http'];

  function UserApi($http) {
    this.password = function (password) {
      return $http.post('/api/users/password', password, { ignoreLoadingBar: true });
    };
    this.profile = function (profile) {
      return $http.post('/api/users/profile', profile, { ignoreLoadingBar: true });
    };
    return this;
  }
}());
