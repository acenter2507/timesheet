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
      prepareCalendar();
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
      vm.events = [];
      if (vm.room.bookings.length === 0) return;
      vm.room.bookings.forEach(function (booking) {
        console.log(booking);
        // var color;
        // var actions = [];
        // switch (rest.status) {
        //   case 1: { // Not send
        //     color = undefined;
        //     color = { primary: '#777', secondary: '#e3e3e3' };
        //     break;
        //   }
        //   case 2: { // Waiting
        //     color = { primary: '#f0ad4e', secondary: '#fae6c9' };
        //     // actions.push(vm.action.approve);
        //     // actions.push(vm.action.reject);
        //     break;
        //   }
        //   case 3: { // Approved
        //     color = { primary: '#5cb85c', secondary: '#bde2bd' };
        //     break;
        //   }
        //   case 4: { // Rejected
        //     color = { primary: '#d9534f', secondary: '#fae3e3' };
        //     break;
        //   }
        //   case 5: { // Done
        //     color = { primary: '#337ab7', secondary: '#D1E8FF' };
        //     break;
        //   }
        // }
        vm.events.push({
          id: booking._id.toString(),
          title: booking.title + '・' + booking.user.displayName,
          // color: color,
          startsAt: moment(booking.start).toDate(),
          endsAt: moment(booking.end).toDate(),
          actions: []
        });
      });
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

    vm.handleSelectedRoom = function (room) {
      vm.room = room;
      prepareEvent();
    };

  }
}());
