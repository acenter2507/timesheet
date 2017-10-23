// Rests service used to communicate Rests REST endpoints
(function () {
  'use strict';

  angular
    .module('rests')
    .factory('RestsService', RestsService);

  RestsService.$inject = ['$resource'];

  function RestsService($resource) {
    return $resource('api/rests/:restId', {
      restId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
