(function () {
  'use strict';

  angular
    .module('rooms')
    .controller('RoomsListController', RoomsListController);

  RoomsListController.$inject = ['$scope', '$state', 'RoomsService', 'BookingsApi'];

  function RoomsListController($scope, $state, RoomsService, BookingsApi) {
    var vm = this;

    onCreate();
    function onCreate() {
      preapreRooms()
        .then(function () {
          return preapreBookings();
        })
        .then(function () {
          return prepareData();
        })
        .then(function () {
          return prepareEvent();
        });
      prepareCalendar();
    }

    function preapreRooms() {
      return new Promise(function (resolve, reject) {
        RoomsService.query().$promise
          .then(function (rooms) {
            vm.rooms = rooms;
            return resolve();
          })
          .catch(function (err) {
            return reject(err);
          });
      });
    }
    function preapreBookings() {
      return new Promise(function (resolve, reject) {
        BookingsApi.waiting()
          .success(function (bookings) {
            vm.bookings = bookings;
            return resolve();
          })
          .error(function (err) {
            return reject(err);
          });
      });
    }
    function prepareData() {
      return new Promise(function (resolve, reject) {
        for (var i = 0; i < vm.rooms.length; i++) {
          var room = vm.rooms[i];
          room.bookings = _.where(vm.bookings, { room: room._id.toString() });
        }
        if (vm.rooms.length > 0) {
          vm.room = vm.rooms[0];
        }
        return resolve();
      });
    }
    function prepareEvent() {
      console.log(vm.rooms);
    }
    function prepareCalendar() {
      vm.calendar = { view: 'month' };
      vm.calendar.start = '08:00';
      vm.calendar.end = '24:00';
      vm.calendar.openCell = false;
      vm.calendar.viewDate = moment().startOf('month').toDate();
      vm.handleCalendarEventClicked = function () {
        return false;
      };
      vm.handleCalendarRangeSelected = function (start, end) {
        return false;
      };
      vm.handleCalendarClicked = function (date) {
        return false;
      };
    }

  }
}());
