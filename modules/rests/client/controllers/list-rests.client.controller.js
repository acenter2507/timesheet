(function () {
  'use strict';

  angular
    .module('rests')
    .controller('RestsListController', RestsListController);

  RestsListController.$inject = ['$scope', '$state', 'RestsService', 'CommonService', 'DateUtil', 'RestsApi', '$document', 'Socket', '$stateParams', 'Notifications'];

  function RestsListController($scope, $state, RestsService, CommonService, DateUtil, RestsApi, $document, Socket, $stateParams, Notifications) {
    var vm = this;
    vm.condition = { sort: '-created' };
    vm.busy = false;
    vm.page = 1;
    vm.pages = [];
    vm.total = 0;
    vm.isShowHistory = false;
    vm.historys = [];
    vm.historyBox = angular.element(document.getElementById('rests-list-historys'));
    vm.restsBox = angular.element(document.getElementById('rests-list-rests'));
    vm.toolsBox = angular.element(document.getElementById('rests-list-tools'));

    onCreate();
    function onCreate() {
      prepareCalendar();
      prepareRestAction();
      handleSearch();
    }
    function prepareNotification() {
      if ($stateParams.notif) {
        Notifications.remove($stateParams.notif);
      }
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
            var rest = _.findWhere(vm.rests, { _id: args.calendarEvent.id });
            vm.handleDeleteRest(rest);
          }
        },
        edit: {
          label: '<i class=\'fa fa-pencil-square-o\'></i>',
          onClick: function (args) {
            $state.go('rests.edit', { restId: args.calendarEvent.id });
          }
        }
      };
    }
    function prepareCalendarEvent() {
      vm.events = [];
      if (vm.rests.length === 0) return;
      vm.rests.forEach(rest => {
        var color;
        var actions = [];
        switch (rest.status) {
          case 1: { // Not send
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
            actions.push(vm.action.edit);
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
    vm.handleDeleteRest = rest => {
      $scope.handleShowConfirm({
        message: '削除しますか？'
      }, () => {
        var rsRest = new RestsService({ _id: rest._id });
        rsRest.$remove(() => {
          vm.rests = _.without(vm.rests, rest);
        });
      });
    };
    vm.handleSendRequestRest = rest => {
      $scope.handleShowConfirm({
        message: '休暇を申請しますか？'
      }, () => {
        RestsApi.request(rest._id)
          .success(data => {
            _.extend(rest, data);
            Socket.emit('request', { restId: rest._id, userId: $scope.user._id });
          })
          .error(err => {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    vm.handleViewHistory = rest => {
      vm.isShowHistory = true;
      vm.historys = rest.historys;
    };
    vm.handleCloseHistory = () => {
      vm.isShowHistory = false;
    };
  }
}());
