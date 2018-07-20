(function () {
  'use strict';

  angular
    .module('bookings.admin')
    .factory('BookingsAdminApi', BookingsAdminApi);

  BookingsAdminApi.$inject = ['$http'];
  function BookingsAdminApi($http) {
    return this;
  }
}());
