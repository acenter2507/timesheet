// Months service used to communicate Months REST endpoints
(function () {
  'use strict';

  angular
    .module('months')
    .factory('MonthsService', MonthsService);

  MonthsService.$inject = ['$resource'];

  function MonthsService($resource) {
    return $resource('api/months/:monthId', {
      monthId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
