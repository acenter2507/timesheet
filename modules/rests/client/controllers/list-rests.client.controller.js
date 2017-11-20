(function () {
  'use strict';

  angular
    .module('rests')
    .controller('RestsListController', RestsListController);

  RestsListController.$inject = ['$scope', '$state', 'RestsService', 'CommonService', 'DateUtil', 'RestsApi'];

  function RestsListController($scope, $state, RestsService, CommonService, DateUtil, RestsApi) {
    var vm = this;
    vm.condition = { sort: '-created' };
    vm.busy = false;
    vm.page = 1;
    vm.pages = [];
    vm.total = 0;
    vm.isShowHistory = false;

    onCreate();
    function onCreate() {
      prepareCalendar();
      prepareRestAction();
      handleSearch();
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
    function prepareRestAction() {
      vm.action = {
        remove: {
          label: '<i class=\'fa fa-trash\'></i>',
          onClick: function (args) {
            console.log('Edited', args.calendarEvent);
          }
        },
        edit: {
          label: '<i class=\'fa fa-pencil-square-o\'></i>',
          onClick: function (args) {
            console.log('Edited', args.calendarEvent);
          }
        },
        approve: {
          label: '<i class=\'fa fa-check-square-o\'></i>',
          onClick: function (args) {
            console.log('Edited', args.calendarEvent);
          }
        },
        reject: {
          label: '<i class=\'fa fa-minus-circle\'></i>',
          onClick: function (args) {
            console.log('Edited', args.calendarEvent);
          }
        }
      };
    }
    function prepareCalendarEvent() {
      vm.events = [];
      vm.rests.forEach(rest => {
        var color;
        var actions = [];
        switch (rest.status) {
          case 1: { // Not send
            color = undefined;
            color = { primary: '#777', secondary: '#e3e3e3' };
            actions.push(vm.action.remove);
            actions.push(vm.action.edit);
            break;
          }
          case 2: { // Waiting
            color = { primary: '#f0ad4e', secondary: '#fae6c9' };
            actions.push(vm.action.remove);
            break;
          }
          case 3: { // Approved
            color = { primary: '#5cb85c', secondary: '#bde2bd' };
            break;
          }
          case 4: { // Rejected
            color = { primary: '#d9534f', secondary: '#fae3e3' };
            actions.push(vm.action.remove);
            break;
          }
          case 5: { // Done
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
    vm.handleStartSearch = () => {
      vm.page = 1;
      handleSearch();
    };
    function handleSearch() {
      if (vm.busy) return;
      vm.busy = true;
      RestsApi.getRestOfCurrentUser(vm.condition, vm.page)
        .success(res => {
          vm.rests = res.docs;
          vm.pages = CommonService.createArrayFromRange(res.pages);
          vm.total = res.total;
          prepareCalendar();
          prepareCalendarEvent();
          vm.busy = false;
        })
        .error(err => {
          $scope.handleshowToast(err.message, true);
          vm.busy = false;
        });
    }
    vm.handleClearCondition = () => {
      vm.condition = { sort: '-created' };
    };
    vm.handlePageChanged = page => {
      vm.page = page;
      vm.handleStartSearch();
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
    vm.handleRestClicked = calendarEvent => {
      $state.go('rests.view', { restId: calendarEvent.id });
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
    vm.handleViewHistory = rest => {
      vm.isShowHistory = true;
    };
  }
}());
