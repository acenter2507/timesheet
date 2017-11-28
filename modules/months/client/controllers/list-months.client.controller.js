(function () {
  'use strict';

  angular
    .module('months')
    .controller('MonthsListController', MonthsListController);

  MonthsListController.$inject = ['MonthsService', '$scope', '$state'];

  function MonthsListController(MonthsService, $scope, $state) {
    var vm = this;
    vm.busy = false;

    onCreate();
    function onCreate() {
      prepareCalendar();
    }

    function prepareCalendar() {
      vm.calendar = { view: 'month' };
      var currentDate = moment().startOf('month').toDate();

      vm.calendar.viewDate = moment().startOf('month').toDate();
      vm.calendar.cellModifier = function (cell) {
        // cell.cssClass = 'odd-cell';
        var date = cell.date.format('YYYY/MM/DD');

        // 週末チェック
        if (DateUtil.isWeekend(cell.date)) {
          return;
        }

        // 祝日チェック
        var offdate = JapaneseHolidays.isHoliday(new Date(date));
        if (offdate) {
          cell.cssClass = 'off-cell';
          return;
        }
      };
    }
    vm.handleCalendarEventClicked = () => {
      return false;
    };
    vm.handleCalendarRangeSelected = (start, end) => {
      return false;
    };
    vm.handleCalendarClicked = date => {
      return false;
    };
    vm.disableWeekend = (date, mode) => {
      var holiday = JapaneseHolidays.isHoliday(new Date(date));
      return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6) || holiday);
    };

  }
}());
