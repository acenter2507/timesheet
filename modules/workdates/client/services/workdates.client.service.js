// Workdates service used to communicate Workdates REST endpoints
(function () {
  'use strict';

  angular
    .module('workdates')
    .factory('WorkdatesService', WorkdatesService);

  WorkdatesService.$inject = ['$resource'];

  function WorkdatesService($resource) {
    return $resource('api/workdates/:workdateId', {
      workdateId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
