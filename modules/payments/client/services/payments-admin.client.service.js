// Payments service used to communicate Payments REST endpoints
(function () {
  'use strict';

  angular
    .module('payments.admin')
    .factory('PaymentsAdminApi', PaymentsAdminApi);

  PaymentsAdminApi.$inject = ['$http'];
  function PaymentsAdminApi($http) {
    this.reviews = function (condition, page) {
      return $http.post('/api/payments/admin/reviews', { condition: condition, page: page }, { ignoreLoadingBar: true });
    };
    this.approve = function (paymentId) {
      return $http.post('/api/payments/admin/' + paymentId + '/approve', null, { ignoreLoadingBar: true });
    };
    this.reject = function (paymentId) {
      return $http.post('/api/payments/admin/' + paymentId + '/reject', null, { ignoreLoadingBar: true });
    };
    return this;
  }
}());
