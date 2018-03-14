// Workrests service used to communicate Workrests REST endpoints
(function () {
  'use strict';

  angular
    .module('workrests')
    .factory('WorkrestsService', WorkrestsService);

  WorkrestsService.$inject = ['$resource'];

  function WorkrestsService($resource) {
    return $resource('api/workrests/:workrestId', {
      workrestId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
