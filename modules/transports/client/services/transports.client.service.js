// Transports service used to communicate Transports REST endpoints
(function () {
  'use strict';

  angular
    .module('transports')
    .factory('TransportsService', TransportsService);

  TransportsService.$inject = ['$resource'];

  function TransportsService($resource) {
    return $resource('api/transports/:transportId', {
      transportId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
