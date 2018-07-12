(function () {
  'use strict';

  angular
    .module('workrests')
    .controller('WorkrestsListController', WorkrestsListController);

  WorkrestsListController.$inject = [
    '$scope',
    '$state',
    'WorkrestsService',
    'CommonService',
    'DateUtil',
    'WorkrestsApi',
    'Socket',
    '$stateParams',
    'Notifications'
  ];

  function WorkrestsListController(
    $scope,
    $state,
    WorkrestsService,
    CommonService,
    DateUtil,
    WorkrestsApi,
    Socket,
    $stateParams,
    Notifications
  ) {
    var vm = this;

    // Pagination
    vm.condition = {};
    vm.busy = false;
    vm.page = 1;
    vm.pages = [];
    vm.total = 0;

    // History and other control
    vm.isShowHistory = false;
    vm.historys = [];

    onCreate();
    function onCreate() {
      prepareCondition();
      prepareNotification();
      prepareCalendar();
      prepareWorkrestAction();
      handleSearch();
    }
    function prepareCondition() {
      vm.condition = {
        sort: '-created',
        limit: 10
      };
      vm.condition.status = ($stateParams.status) ? $stateParams.status : undefined;
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
    function prepareWorkrestAction() {
      vm.action = {
        remove: {
          label: '<i class=\'fa fa-trash\'></i>',
          onClick: function (args) {
            var workrest = _.findWhere(vm.workrests, { _id: args.calendarEvent.id });
            vm.handleDeleteWorkrest(workrest);
          }
        },
        edit: {
          label: '<i class=\'fa fa-pencil-square-o\'></i>',
          onClick: function (args) {
            $state.go('workrests.edit', { workrestId: args.calendarEvent.id });
          }
        }
      };
    }
    function prepareCalendarEvent() {
      vm.events = [];
      if (vm.workrests.length === 0) return;
      vm.workrests.forEach(function (workrest) {
        var color;
        var actions = [];
        switch (workrest.status) {
          case 1: { // Not send
            color = { primary: '#777', secondary: '#e3e3e3' };
            // actions.push(vm.action.remove);
            // actions.push(vm.action.edit);
            break;
          }
          case 2: { // Waiting
            color = { primary: '#f0ad4e', secondary: '#fae6c9' };
            // actions.push(vm.action.remove);
            break;
          }
          case 3: { // Approved
            color = { primary: '#5cb85c', secondary: '#bde2bd' };
            break;
          }
          case 4: { // Rejected
            color = { primary: '#d9534f', secondary: '#fae3e3' };
            // actions.push(vm.action.remove);
            // actions.push(vm.action.edit);
            break;
          }
          case 5: { // Done
            color = { primary: '#337ab7', secondary: '#D1E8FF' };
            break;
          }
        }
        vm.events.push({
          id: workrest._id.toString(),
          title: workrest.holiday.name,
          color: color,
          startsAt: moment(workrest.start).toDate(),
          endsAt: moment(workrest.end).toDate(),
          actions: actions
        });
      });
    }
    vm.handleStartSearch = function () {
      vm.page = 1;
      handleSearch();
    };
    function handleSearch() {
      if (vm.busy) return;
      vm.busy = true;
      WorkrestsApi.list(vm.condition, vm.page)
        .success(function (res) {
          vm.workrests = res.docs;
          vm.pages = res.pages;
          vm.total = res.total;
          vm.busy = false;
          prepareCalendar();
          prepareCalendarEvent();
          vm.busy = false;
        })
        .error(function (err) {
          $scope.handleshowToast(err.message, true);
          vm.busy = false;
        });
    }
    vm.handleClearCondition = function () {
      prepareCondition();
    };
    vm.handlePageChanged = function () {
      handleSearch();
    };
    vm.handleWorkrestClicked = function (calendarEvent) {
      $state.go('workrests.view', { workrestId: calendarEvent.id });
    };
    // Xóa bỏ Ngày nghỉ
    vm.handleDeleteWorkrest = function (workrest) {
      $scope.handleShowConfirm({
        message: '削除しますか？'
      }, function () {
        var rsWorkrest = new WorkrestsService({ _id: workrest._id });
        rsWorkrest.$remove(function () {
          vm.workrests = _.without(vm.workrests, workrest);
        });
      });
    };
    // Gửi thỉnh cầu đến leader
    vm.handleRequestWorkrest = function (workrest) {
      $scope.handleShowConfirm({
        message: '休暇を申請しますか？'
      }, function () {
        WorkrestsApi.request(workrest._id)
          .success(function (data) {
            _.extend(workrest, data);
            Socket.emit('rest_request', { workrestId: workrest._id, userId: $scope.user._id });
          })
          .error(function (err) {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    // Hủy bỏ thỉnh cầu
    vm.handleCancelWorkrest = function (workrest) {
      $scope.handleShowConfirm({
        message: '休暇の申請を取り消しますか？'
      }, function () {
        WorkrestsApi.cancel(workrest._id)
          .success(function (data) {
            _.extend(workrest, data);
          })
          .error(function (err) {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    // Gửi thỉnh cầu xóa bỏ ngày nghỉ
    vm.handleRequestDelete = function (workrest) {
      $scope.handleShowConfirm({
        message: '休暇を取り消す申請を送りますか？'
      }, function () {
        WorkrestsApi.requestDelete(workrest._id)
          .success(function (data) {
            _.extend(workrest, data);
            Socket.emit('rest_delete_request', { workrestId: workrest._id, userId: $scope.user._id });
          })
          .error(function (err) {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    vm.handleViewHistory = function (workrest) {
      vm.isShowHistory = true;
      vm.historys = workrest.historys;
    };
    vm.handleCloseHistory = function () {
      vm.isShowHistory = false;
    };

  }
}());
