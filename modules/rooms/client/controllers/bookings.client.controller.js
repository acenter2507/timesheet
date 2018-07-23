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
    vm.error = {};
    console.log(vm.current.format());

    preapareCondition();
    function preapareCondition() {
      vm.condition = {
        min_date: vm.current.format('YYYY/MM/DD'),
        start_date: vm.current.format('YYYY/MM/DD'),
        end_date: vm.current.format('YYYY/MM/DD'),
        start_time: '08:00',
        end_time: '23:30',
        seats: 1,
        computer: 0,
        projector: false,
        air_conditional: false,
        white_board: false,
        sound: false
        
        // start_time: vm.current.startOf('hour').add(1, 'hours').format('HH:mm'),
        // end_time: vm.current.startOf('hour').add(2, 'hours').format('HH:mm')
      };
    }

    vm.handleNextToRooms = function() {
      console.log(vm.condition);
      validateCondition();
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
      if (typeof vm.condition.start_date === 'object') {
        var start_date = moment(vm.condition.start_date).format('YYYY/MM/DD');
      } else {
        start_date = vm.condition.start_date;
      }
      if (typeof vm.condition.end_date === 'object') {
        var end_date = moment(vm.condition.end_date).format('YYYY/MM/DD');
      } else {
        end_date = vm.condition.end_date;
      }

      var start = moment(start_date + ' ' + vm.condition.start_time, 'YYYY/MM/DD HH:mm');
      var end = moment(end_date + ' ' + vm.condition.end_time, 'YYYY/MM/DD HH:mm');
      if(!start.isBefore(end)) {
        $scope.handleShowToast('開始と終了時間が合わないです。再確認してください！', true);
        return false;
      }

    }
    function validateRoom() {

    }

  }
}());
