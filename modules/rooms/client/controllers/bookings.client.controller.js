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
    vm.condition = {};
    vm.step = 1;

    function preapareCondition() {
      
    }

    vm.handleNextToRooms = function() {
      vm.step = 2;
    };
    vm.handleNextToConfirm = function() {
      vm.step = 3;
    };
    vm.handleSaveBooking = function() {
      vm.step = 4;
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
