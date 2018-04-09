(function () {
  'use strict';

  angular
    .module('workrests')
    .controller('WorkrestsListController', WorkrestsListController);

  WorkrestsListController.$inject = ['$scope', '$state', 'WorkrestsService', 'CommonService', 'DateUtil', 'WorkrestsApi', '$document', 'Socket', '$stateParams', 'Notifications'];

  function WorkrestsListController($scope, $state, WorkrestsService, CommonService, DateUtil, WorkrestsApi, $document, Socket, $stateParams, Notifications) {
    var vm = this;

    // Pagination
    vm.condition = { sort: '-created' };
    vm.busy = false;
    vm.page = 1;
    vm.pages = [];
    vm.total = 0;
    
    // History and other control
    vm.isShowHistory = false;
    vm.historys = [];
    vm.historyBox = angular.element(document.getElementById('rests-list-historys'));
    vm.restsBox = angular.element(document.getElementById('rests-list-rests'));
    vm.toolsBox = angular.element(document.getElementById('rests-list-tools'));

    onCreate();
    function onCreate() {
      prepareNotification();
      prepareCalendar();
      prepareWorkrestAction();
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
      vm.workrests.forEach(rest => {
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
      WorkrestsApi.getRestOfCurrentUser(vm.condition, vm.page)
        .success(res => {
          vm.workrests = res.docs;
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
      $state.go('workrests.view', { workrestId: calendarEvent.id });
    };
    // Xóa bỏ Ngày nghỉ
    vm.handleDeleteRest = workrest => {
      $scope.handleShowConfirm({
        message: '削除しますか？'
      }, () => {
        var rsRest = new WorkrestsService({ _id: workrest._id });
        rsRest.$remove(() => {
          vm.workrests = _.without(vm.workrests, workrest);
        });
      });
    };
    // Gửi thỉnh cầu đến leader
    vm.handleSendRequestRest = workrest => {
      $scope.handleShowConfirm({
        message: '休暇を申請しますか？'
      }, () => {
        WorkrestsApi.request(workrest._id)
          .success(data => {
            _.extend(workrest, data);
            Socket.emit('rest_request', { workrestId: workrest._id, userId: $scope.user._id });
          })
          .error(err => {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    // Hủy bỏ thỉnh cầu
    vm.handleCancelRequestRest = workrest => {
      $scope.handleShowConfirm({
        message: '休暇の申請を取り消しますか？'
      }, () => {
        WorkrestsApi.cancel(workrest._id)
          .success(data => {
            _.extend(workrest, data);
          })
          .error(err => {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    // Gửi thỉnh cầu xóa bỏ ngày nghỉ
    vm.handleSendRequestDelete = workrest => {
      $scope.handleShowConfirm({
        message: '休暇を取り消す申請を送りますか？'
      }, () => {
        WorkrestsApi.deleteRequest(workrest._id)
          .success(data => {
            _.extend(workrest, data);
            Socket.emit('rest_delete_request', { workrestId: workrest._id, userId: $scope.user._id });
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
    // View user detail page
    vm.handleViewDetailUser = user => {
      if ($scope.isAdmin || $scope.isAccountant) {
        return $state.go('users.view', { userId: user._id });
      } else {
        return $state.go('profile.view', { userId: user._id });
      }
    };

  }
}());
