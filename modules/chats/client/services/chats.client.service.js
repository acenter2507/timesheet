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
      get: { ignoreLoadingBar: true },
      update: { method: 'PUT', ignoreLoadingBar: true },
      query: { ignoreLoadingBar: true }
    });
  }

  ChatsApi.$inject = ['$http'];
  function ChatsApi($http) {
    this.users = function (paginate) {
      return $http.post('/api/chats/users', { paginate: paginate }, { ignoreLoadingBar: true });
    };
    this.load = function (room, paginate) {
      return $http.post('/api/chats/load', { room: room, paginate: paginate }, { ignoreLoadingBar: true });
    };
    return this;
  }
}());
