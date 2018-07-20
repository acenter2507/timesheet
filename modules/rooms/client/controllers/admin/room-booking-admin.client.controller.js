(function () {
  'use strict';

  // Rooms controller
  angular
    .module('rooms')
    .controller('RoomBookingAdminController', RoomBookingAdminController);

  RoomBookingAdminController.$inject = [
    '$scope',
    '$state',
    'roomResolve',
    'RoomsAdminApi',
    'BookingsAdminApi'
  ];

  function RoomBookingAdminController(
    $scope,
    $state,
    room,
    RoomsAdminApi,
    BookingsAdminApi) {

    var vm = this;
    vm.room = room;
    onCreate();
    function onCreate() {
      prepareBookings();
    }

    function prepareBookings() {
      RoomsAdminApi.bookings(vm.room._id)
        .success(function (bookings) {
          vm.bookings = bookings;
        })
        .error(function (err) {
          $scope.handleShowToast(err.message, true);
        });
    }

    vm.hanleSelectBooking = function (booking) {
      return;
    }
    vm.handleRejectBooking = function (booking) {
      $scope.handleShowConfirm({
        message: '予約を拒否しますか？'
      }, function () {
        BookingsAdminApi.reject(booking._id)
          .success(function (_booking) {
            _.extend(booking, _booking);
          })
          .error(function (err) {
            $scope.handleShowToast(err.message, true);
          });
      });
    }
  }
}());
