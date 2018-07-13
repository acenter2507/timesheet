// Payments service used to communicate Payments REST endpoints
(function () {
  'use strict';

  angular
    .module('payments')
    .factory('PaymentsService', PaymentsService)
    .factory('PaymentsApi', PaymentsApi);

  PaymentsService.$inject = ['$resource'];

  function PaymentsService($resource) {
    return $resource('api/payments/:paymentId', { paymentId: '@_id' }, {
      save: { method: 'POST', ignoreLoadingBar: true },
      get: { method: 'GET', ignoreLoadingBar: true },
      update: { method: 'PUT', ignoreLoadingBar: true },
      remove: { method: 'DELETE', ignoreLoadingBar: true },
      query: { isArray: true, ignoreLoadingBar: true }
    });
  }

  PaymentsApi.$inject = ['$http'];
  function PaymentsApi($http) {
    this.list = function (year) {
      return $http.post('/api/payments/list', { year: year }, { ignoreLoadingBar: true });
    };
    this.request = function (paymentId) {
      return $http.post('/api/payments/' + paymentId + '/request', null, { ignoreLoadingBar: true });
    };
    this.cancel = function (paymentId) {
      return $http.post('/api/payments/' + paymentId + '/cancel', null, { ignoreLoadingBar: true });
    };
    this.requestDelete = function (paymentId) {
      return $http.post('/api/payments/' + paymentId + '/requestDelete', null, { ignoreLoadingBar: true });
    };
    this.deleteReceipt = function (paymentId, receipt) {
      return $http.post('/api/payments/' + paymentId + '/deleteReceipt', { receipt: receipt }, { ignoreLoadingBar: true });
    };
    return this;
  }
}());
