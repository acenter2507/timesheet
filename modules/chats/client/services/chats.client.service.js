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
      update: {
        method: 'PUT'
      }
    });
  }
  ChatsApi.$inject = ['$http'];
  function ChatsApi($http) {
    this.load = function (paginate) {
      return $http.post('/api/chats/users', { paginate: paginate }, { ignoreLoadingBar: true });
    };
    return this;
  }
}());
