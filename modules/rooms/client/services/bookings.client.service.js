// Rooms service used to communicate Rooms REST endpoints
(function () {
  'use strict';

  angular
    .module('bookings')
    .factory('BookingsService', BookingsService)
    .factory('BookingsApi', BookingsApi);

  BookingsService.$inject = ['$resource'];

  function BookingsService($resource) {
    return $resource('api/bookings/:bookingId', { bookingId: '@_id' }, {
      save: { method: 'POST', ignoreLoadingBar: true },
      get: { method: 'GET', ignoreLoadingBar: true },
      update: { method: 'PUT', ignoreLoadingBar: true },
      remove: { method: 'DELETE', ignoreLoadingBar: true },
      query: { isArray: true, ignoreLoadingBar: true }
    });
  }

  BookingsApi.$inject = ['$http'];
  function BookingsApi($http) {
    return this;
  }
}());
