// Holidays service used to communicate Holidays REST endpoints
(function () {
  'use strict';

  angular
    .module('holidays')
    .factory('HolidaysService', HolidaysService);

  HolidaysService.$inject = ['$resource'];

  function HolidaysService($resource) {
    return $resource('api/holidays/:holidayId', { holidayId: '@_id' }, {
      get: { ignoreLoadingBar: true },
      update: { method: 'PUT', ignoreLoadingBar: true },
      query: { ignoreLoadingBar: true }
    });
  }
}());
