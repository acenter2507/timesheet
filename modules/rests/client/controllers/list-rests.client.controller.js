(function () {
  'use strict';

  angular
    .module('rests')
    .controller('RestsListController', RestsListController);

  RestsListController.$inject = ['$scope', 'RestsService', 'CommonService', 'DateUtil', 'RestsApi'];

  function RestsListController($scope, RestsService, CommonService, DateUtil, RestsApi) {
    var vm = this;
    vm.events = [];
    vm.condition = { sort: '-created' };
    vm.busy = false;
    vm.page = 1;

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
          console.log('Edited', args.calendarEvent);
        }
      }, {
        label: '<i class=\'glyphicon glyphicon-remove\'></i>',
        onClick: function (args) {
          console.log('Deleted', args.calendarEvent);
        }
      }];
      vm.rests.forEach(rest => {
        var color;
        switch (rest.status) {
          case 1: {
            color = undefined;
            color = { primary: '#777', secondary: '#e3e3e3' };
            break;
          }
          case 2: {
            color = { primary: '#f0ad4e', secondary: '#fae6c9' };
            break;
          }
          case 3: {
            color = { primary: '#5cb85c', secondary: '#bde2bd' };
            break;
          }
          case 4: {
            color = { primary: '#d9534f', secondary: '#fae3e3' };
            break;
          }
          case 5: {
            color = { primary: '#337ab7', secondary: '#D1E8FF' };
            break;
          }
        }
        vm.events.push({
          id: rest._id.toString(),
          title: rest.holiday.name,
          color: color,
          startsAt: moment(rest.start).toDate(),
          endsAt: moment(rest.end).toDate(),
          actions: actions
        });
      });
    }
    vm.handleClearCondition = () => {
      vm.condition = { sort: '-created' };
    };
    vm.handleStartSearch = () => {
      if (vm.busy) return;
      vm.busy = true;
      RestsApi.getRestOfCurrentUser(vm.condition, vm.page)
        .success(data => {
          console.log(data);
          vm.busy = false;
        })
        .error(err => {
          console.log(err);
          vm.busy = false;
        });

    };
    vm.handleCalendarEventClicked = () => {
      return false;
    };
    vm.handleCalendarRangeSelected = (start, end) => {
      return false;
    };
    vm.handleCalendarClicked = date => {
      return false;
    };
    vm.handleChangeRestStatus = status => {
      if (status !== 2) return;
      $scope.handleShowConfirm({
        message: '休暇を申請しますか？'
      }, () => {
        console.log('bbb');
      });
    };
    vm.handleDeleteRest = rest => {
      $scope.handleShowConfirm({
        message: '削除しますか？'
      }, () => {
        console.log('bbb');
      });
    };
  }
}());
