// Holidays service used to communicate Holidays REST endpoints
(function () {
  'use strict';

  angular
    .module('holidays')
    .factory('HolidaysService', HolidaysService);

  HolidaysService.$inject = ['$resource'];

  function HolidaysService($resource) {
    return $resource('api/holidays/:holidayId', { holidayId: '@_id' }, {
      save: { method: 'POST', ignoreLoadingBar: true },
      get: { method: 'GET', ignoreLoadingBar: true },
      remove: { method: 'DELETE', ignoreLoadingBar: true },
      update: { method: 'PUT', ignoreLoadingBar: true },
      query: { isArray: true, ignoreLoadingBar: true }
    });
  }
}());
