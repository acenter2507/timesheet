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
    this.update = function (profile) {
      return $http.post('/api/users/profile', profile, { ignoreLoadingBar: true });
    };
    this.profile = function (userId) {
      return $http.post('/api/users/' + userId + 'profile', null, { ignoreLoadingBar: true });
    };
    return this;
  }
}());
