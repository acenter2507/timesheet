// Workmonths service used to communicate Workmonths REST endpoints
(function () {
  'use strict';

  angular
    .module('workmonths')
    .factory('WorkmonthsService', WorkmonthsService);

  WorkmonthsService.$inject = ['$resource'];

  function WorkmonthsService($resource) {
    return $resource('api/workmonths/:workmonthId', {
      workmonthId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
