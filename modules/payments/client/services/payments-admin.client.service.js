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
    return this;
  }
}());
