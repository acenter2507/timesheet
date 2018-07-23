(function () {
  'use strict';

  angular
    .module('rooms')
    .controller('RoomsListController', RoomsListController);

  RoomsListController.$inject = ['$scope', '$state', 'RoomsService', 'BookingsApi', 'calendarConfig'];

  function RoomsListController($scope, $state, RoomsService, BookingsApi, calendarConfig) {
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
        vm.events.push({
          id: booking._id.toString(),
          title: booking.title + '・' + booking.user.displayName,
          color: { primary: '#5cb85c', secondary: '#bde2bd' },
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
      vm.handleTimespanClicked = function (date, cell) {
        if (vm.calendar.view === 'month') {
          if ((vm.calendar.openCell && moment(date).startOf('day').isSame(moment(vm.calendar.viewDate).startOf('day'))) || cell.events.length === 0 || !cell.inMonth) {
            vm.calendar.openCell = false;
          } else {
            vm.calendar.openCell = true;
            vm.calendar.viewDate = date;
          }
        } else if (vm.calendarView === 'year') {
          if ((vm.calendar.openCell && moment(date).startOf('month').isSame(moment(vm.calendar.viewDate).startOf('month'))) || cell.events.length === 0) {
            vm.calendar.openCell = false;
          } else {
            vm.calendar.openCell = true;
            vm.calendar.viewDate = date;
          }
        }
      };
      vm.handleEventClicked = function (calendarEvent) {
        console.log('on-event-click', calendarEvent);
        return false;
      };
    }

    vm.handleSelectedRoom = function (room) {
      vm.room = room;
      prepareEvent();
    };

  }
}());
