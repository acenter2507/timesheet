// Chats service used to communicate Chats REST endpoints
(function () {
  'use strict';

  angular
    .module('chats')
    .factory('RoomsService', RoomsService);

  RoomsService.$inject = ['$resource'];

  function RoomsService($resource) {
    return $resource('api/rooms/:chatId', { roomId: '@_id' }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
