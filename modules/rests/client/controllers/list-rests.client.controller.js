(function () {
  'use strict';

  angular
    .module('rests')
    .controller('RestsListController', RestsListController);

  RestsListController.$inject = ['RestsService', 'CommonService', 'DateUtil', 'calendarConfig'];

  function RestsListController(RestsService, CommonService, DateUtil, calendarConfig) {
    var vm = this;
    vm.events = [];

    onCreate();
    function onCreate() {
      prepareRests().then(rests => {
        vm.rests = rests;
        prepareCalendar();
        prepareCalendarEvent();
        console.log(vm.events);
      });
    }
    function prepareRests() {
      return RestsService.query().$promise;
    }
    function prepareCalendar() {
      vm.calendar = { view: 'month' };
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

        // 選択された範囲チェック
        // if (cell.date.isBetween(vm.rest.start, vm.rest.end, null, '[]')) {
        //   cell.cssClass = 'selected-cell';
        //   return;
        // }
      };
    }
    function prepareCalendarEvent() {
      var actions = [{
        label: '<i class=\'glyphicon glyphicon-pencil\'></i>',
        onClick: function (args) {
          alert.show('Edited', args.calendarEvent);
        }
      }, {
        label: '<i class=\'glyphicon glyphicon-remove\'></i>',
        onClick: function (args) {
          alert.show('Deleted', args.calendarEvent);
        }
      }];
      vm.rests.forEach(rest => {
        var color;
        switch (rest.status) {
          case 1: {
            color = calendarConfig.colorTypes.default;
            break;
          }
          case 2: {
            color = calendarConfig.colorTypes.warning;
            break;
          }
          case 3: {
            color = calendarConfig.colorTypes.primary;
            break;
          }
          case 4: {
            color = calendarConfig.colorTypes.important;
            break;
          }
          case 5: {
            color = calendarConfig.colorTypes.success;
            break;
          }
        }
        vm.events.push({
          title: 'An event',
          color: color,
          startsAt: moment(rest.start).toDate(),
          endsAt: moment(rest.end).toDate(),
          draggable: true,
          resizable: true,
          actions: actions
        });
      });
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
  }
}());
