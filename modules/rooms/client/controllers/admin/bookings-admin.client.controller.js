(function () {
  'use strict';

  angular
    .module('bookings.admin')
    .controller('BookingsAdminController', BookingsAdminController);

  BookingsAdminController.$inject = ['$scope', '$state'];

  function BookingsAdminController($scope, $state) {
    var vm = this;
  }
}());
