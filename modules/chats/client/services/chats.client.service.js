// Chats service used to communicate Chats REST endpoints
(function () {
  'use strict';

  angular
    .module('chats')
    .factory('ChatsService', ChatsService);

  ChatsService.$inject = ['$resource'];

  function ChatsService($resource) {
    return $resource('api/chats/:chatId', {
      chatId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
