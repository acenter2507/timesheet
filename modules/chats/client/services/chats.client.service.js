// Chats service used to communicate Chats REST endpoints
(function () {
  'use strict';

  angular
    .module('chats')
    .factory('ChatsService', ChatsService)
    .factory('ChatsApi', ChatsApi);

  ChatsService.$inject = ['$resource'];
  function ChatsService($resource) {
    return $resource('api/chats/:chatId', { chatId: '@_id' }, {
      save: { method: 'POST', ignoreLoadingBar: true },
      get: { method: 'GET', ignoreLoadingBar: true },
      update: { method: 'PUT', ignoreLoadingBar: true },
      query: { isArray: true, ignoreLoadingBar: true }
    });
  }

  ChatsApi.$inject = ['$http'];
  function ChatsApi($http) {
    this.users = function (paginate) {
      return $http.post('/api/chats/users', { paginate: paginate }, { ignoreLoadingBar: true });
    };
    this.load = function (group, paginate) {
      return $http.post('/api/chats/load', { group: group, paginate: paginate }, { ignoreLoadingBar: true });
    };
    return this;
  }
}());
