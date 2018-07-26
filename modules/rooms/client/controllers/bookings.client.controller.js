(function () {
  'use strict';

  // Bookings controller
  angular
    .module('bookings')
    .controller('BookingsController', BookingsController);

  BookingsController.$inject = [
    '$scope',
    '$state',
    'bookingResolve',
    'BookingsApi',
    '$window',
    'CommonService',
    '$q',
    'Socket'];

  function BookingsController($scope, $state, booking, BookingsApi, $window, CommonService, $q, Socket) {
    var vm = this;
    vm.booking = booking;
    vm.step = 1;
    vm.current = moment();
    vm.error = {};
    vm.form = {};

    vm.busy = false;

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

    vm.handleNextToRooms = function () {
      if (vm.busy) return;
      vm.busy = true;
      if (!validateCondition()) {
        vm.busy = false;
        return;
      }
      BookingsApi.rooms(vm.condition)
        .success(function (rooms) {
          vm.rooms = rooms;
          vm.busy = false;
          if (vm.rooms.length === 0) {
            $scope.handleShowToast('只今会議室が空いていません！', true);
          } else {
            vm.step = 2;
          }
        })
        .error(function (err) {
          $scope.handleShowToast(err.message, true);
          vm.busy = false;
        });
    };
    vm.handleNextToConfirm = function (room) {
      vm.room = room;
      vm.step = 3;
    };
    vm.handleSaveBooking = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.bookingForm');
        return false;
      }
      $scope.handleShowConfirm({
        message: '予約しますか？'
      }, function () {
        if (vm.busy) return;
        vm.busy = true;
        _.extend(vm.booking, vm.condition);
        vm.booking.room = vm.room._id;
        vm.booking.members = _.pluck(vm.condition.users, '_id');

        vm.booking.$save(successCallback, errorCallback);
        function successCallback(booking) {
          vm.busy = false;
          vm.step = 4;
          Socket.emit('bookings', { booking: booking._id });
        }
        function errorCallback(err) {
          $scope.handleShowToast(err.data.message, true);
          vm.busy = false;
        }
      });
    };
    vm.handleBackToCondition = function () {
      vm.rooms = [];
      vm.step = 1;
    };
    vm.handleBackToRooms = function () {
      delete vm.room;
      vm.step = 2;
    };
    vm.hanleSelectRoom = function (room) {
      var url = $state.href('rooms.view', { roomId: room._id });
      $window.open(url, '_blank');
    };
    vm.handleSearchUsers = function ($query) {
      if (CommonService.isStringEmpty($query)) {
        return [];
      }

      var deferred = $q.defer();
      CommonService.autocompleteUsers({ key: $query })
        .success(function (users) {
          deferred.resolve(users);
        });

      return deferred.promise;
    };
    function validateCondition() {
      var start_date, end_date = '';
      if (typeof vm.condition.start_date === 'object') {
        start_date = moment(vm.condition.start_date).format('YYYY/MM/DD');
      } else {
        start_date = vm.condition.start_date;
      }
      if (typeof vm.condition.end_date === 'object') {
        end_date = moment(vm.condition.end_date).format('YYYY/MM/DD');
      } else {
        end_date = vm.condition.end_date;
      }

      var start = moment(start_date + ' ' + vm.condition.start_time, 'YYYY/MM/DD HH:mm');
      var end = moment(end_date + ' ' + vm.condition.end_time, 'YYYY/MM/DD HH:mm');
      if (!start.isBefore(end)) {
        $scope.handleShowToast('開始と終了時間が合わないです。再確認してください！', true);
        return false;
      }
      vm.condition.start = start.format();
      vm.condition.end = end.format();
      return true;
    }
  }
}());
