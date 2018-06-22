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
      update: {
        method: 'PUT'
      }
    });
  }

  PaymentsApi.$inject = ['$http'];
  function PaymentsApi($http) {
    this.getPaymentsByYear = function (year) {
      return $http.post('/api/payments/paymentsByYear', { year: year }, { ignoreLoadingBar: true });
    };
    this.request = function (paymentId) {
      return $http.post('/api/payments/' + paymentId + '/request', null, { ignoreLoadingBar: true });
    };
    return this;
  }
}());
