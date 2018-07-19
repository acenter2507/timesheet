// Rooms service used to communicate Rooms REST endpoints
(function () {
  'use strict';

  angular
    .module('rooms')
    .factory('RoomsService', RoomsService);

  RoomsService.$inject = ['$resource'];

  function RoomsService($resource) {
    return $resource('api/rooms/:roomId', {
      roomId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
