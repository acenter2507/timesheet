(function () {
  'use strict';

  angular
    .module('rooms')
    .controller('RoomsListController', RoomsListController);

  RoomsListController.$inject = ['RoomsService'];

  function RoomsListController(RoomsService) {
    var vm = this;
    vm.rooms = RoomsService.query();

    onCreate();
    function onCreate() {
      prepareCalendar();
    }
    function prepareBookings() {

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
