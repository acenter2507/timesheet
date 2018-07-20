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
    vm.step = 1;

    vm.handleNextToRooms = function() {
      vm.step = 2;
    };
    vm.handleNextToConfirm = function() {
      vm.step = 3;
    };
    vm.handleSaveBooking = function() {
      alert('Save');
    };
    vm.handleBackToCondition = function() {
      vm.step = 1;
    };
    vm.handleBackToRooms = function() {
      vm.step = 2;
    };
    function validateCondition() {

    }
    function validateRoom() {

    }

  }
}());
