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
    function prepareCalendar() {
      vm.calendar = { view: 'day' };
      vm.calendar.viewDate = moment().startOf('day').toDate();
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
