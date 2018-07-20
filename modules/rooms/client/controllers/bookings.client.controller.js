(function () {
  'use strict';

  // Bookings controller
  angular
    .module('bookings')
    .controller('BookingsController', BookingsController);

  BookingsController.$inject = ['$scope', '$state', 'bookingResolve'];

  function BookingsController ($scope, $state, booking) {
    var vm = this;
    vm.booking = booking;
    vm.steps = 1;

    function validateCondition() {

    }
    function validateRoom() {

    }

  }
}());
