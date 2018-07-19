// Chats service used to communicate Chats REST endpoints
(function () {
  'use strict';

  angular
    .module('chats')
    .factory('GroupsService', GroupsService)
    .factory('GroupsApi', GroupsApi);

  GroupsService.$inject = ['$resource'];
  function GroupsService($resource) {
    return $resource('api/groups/:groupId', { groupId: '@_id' }, {
      save: { method: 'POST', ignoreLoadingBar: true },
      get: { method: 'GET', ignoreLoadingBar: true },
      update: { method: 'PUT', ignoreLoadingBar: true },
      query: { isArray: true, ignoreLoadingBar: true }
    });
  }

  GroupsApi.$inject = ['$http'];
  function GroupsApi($http) {
    this.load = function (condition) {
      return $http.post('/api/groups/load', { condition: condition }, { ignoreLoadingBar: true });
    };
    this.privateGroup = function (user) {
      return $http.post('/api/groups/privateGroup', { user: user }, { ignoreLoadingBar: true });
    };
    this.myGroup = function () {
      return $http.post('/api/groups/myGroup', {}, { ignoreLoadingBar: true });
    };
    return this;
  }
}());
