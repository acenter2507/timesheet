(function () {
  'use strict';

  angular
    .module('bookings.admin')
    .factory('BookingsAdminApi', BookingsAdminApi);

  BookingsAdminApi.$inject = ['$http'];
  function BookingsAdminApi($http) {
    this.reject = function (bookingId) {
      return $http.post('/api/bookings/admin/' + bookingId + '/reject', null, { ignoreLoadingBar: true });
    };
    return this;
  }
}());
