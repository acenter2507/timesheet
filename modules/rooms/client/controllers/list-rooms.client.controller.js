(function () {
  'use strict';

  angular
    .module('rooms')
    .controller('RoomsListController', RoomsListController);

  RoomsListController.$inject = ['RoomsService'];

  function RoomsListController(RoomsService) {
    var vm = this;

    onCreate();
    function onCreate() {
      preapreRooms().then(function () {
        return preapreBookings();
      })
      prepareData();
      prepareCalendar();
    }

    function preapreRooms() {
      return new Promise(function (resolve, reject) {
        RoomsService.query().$promise
          .then(function (rooms) {
            vm.rooms = rooms;
            if (vm.rooms.length !== 0) {
              vm.room = vm.rooms[0];
            }
            return resolve();
          })
          .catch(function (err) {
            return reject(err);
          });
      });
    }
    function preapreBookings() {
      return new Promise(function (resolve, reject) {
      });
    }
    function prepareCalendar() {
      vm.calendar = { view: 'day' };
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
