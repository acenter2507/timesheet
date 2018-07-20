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
    vm.current = moment();

    preapareCondition();
    function preapareCondition() {
      vm.condition = {
        min_date: vm.current.format('YYYY/MM/DD'),
        start_date: vm.current.format('YYYY/MM/DD'),
        end_date: vm.current.format('YYYY/MM/DD'),
        start_hour: '08:00',
        end_hour: '23:30',
        seats: 1,
        computer: 1,
        projector: false,
        air_conditional: false,
        white_board: false,
        sound: false
        
        // start_hour: vm.current.startOf('hour').add(1, 'hours').format('HH:mm'),
        // end_hour: vm.current.startOf('hour').add(2, 'hours').format('HH:mm')
      };
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
