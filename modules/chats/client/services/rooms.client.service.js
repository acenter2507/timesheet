// Chats service used to communicate Chats REST endpoints
(function () {
  'use strict';

  angular
    .module('chats')
    .factory('RoomsService', RoomsService)
    .factory('RoomsApi', RoomsApi);

  RoomsService.$inject = ['$resource'];

  function RoomsService($resource) {
    return $resource('api/rooms/:roomId', { roomId: '@_id' }, {
      update: {
        method: 'PUT'
      }
    });
  }

  RoomsApi.$inject = ['$http'];
  function RoomsApi($http) {
    this.load = function (condition) {
      return $http.post('/api/rooms/load', { condition: condition }, { ignoreLoadingBar: true });
    };
    this.privateRoom = function (user) {
      return $http.post('/api/rooms/privateRoom', { user: user }, { ignoreLoadingBar: true });
    };
    return this;
  }
}());
