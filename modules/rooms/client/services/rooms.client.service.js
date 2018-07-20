// Rooms service used to communicate Rooms REST endpoints
(function () {
  'use strict';

  angular
    .module('rooms')
    .factory('RoomsService', RoomsService)
    .factory('RoomsApi', RoomsApi);

  RoomsService.$inject = ['$resource'];

  function RoomsService($resource) {
    return $resource('api/rooms/:roomId', { roomId: '@_id' }, {
      save: { method: 'POST', ignoreLoadingBar: true },
      get: { method: 'GET', ignoreLoadingBar: true },
      update: { method: 'PUT', ignoreLoadingBar: true },
      remove: { method: 'DELETE', ignoreLoadingBar: true },
      query: { isArray: true, ignoreLoadingBar: true }
    });
  }

  RoomsApi.$inject = ['$http'];
  function RoomsApi($http) {
    return this;
  }
}());
