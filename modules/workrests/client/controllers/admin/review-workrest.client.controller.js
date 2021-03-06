(function () {
  'use strict';

  angular
    .module('workrests.admin')
    .controller('WorkrestReviewController', WorkrestReviewController);

  WorkrestReviewController.$inject = [
    '$scope',
    '$state',
    'workrestResolve',
    'CommonService',
    'DateUtil',
    'WorkrestsAdminApi',
    'WorkrestsService',
    'Socket',
    '$stateParams',
    'Notifications'
  ];

  function WorkrestReviewController(
    $scope,
    $state,
    workrest,
    CommonService,
    DateUtil,
    WorkrestsAdminApi,
    WorkrestsService,
    Socket,
    $stateParams,
    Notifications
  ) {
    var vm = this;
    vm.workrest = workrest;
    vm.isShowHistory = false;

    onCreate();
    function onCreate() {
      prepareSecurity();
      prepareNotification();
      prepareCalendar();
    }

    function prepareSecurity() {
      // 自分の休暇
      if (vm.workrest.isCurrentUserOwner) return;
      // 他人の休暇で自分がリーダじゃない場合
      if (!vm.workrest.isCurrentUserOwner && !$scope.isLeader) {
        $scope.handleShowToast('アクセス権限がありません！', true);
        return $scope.handleBackScreen('home');
      }
      // 休暇の本人のリーダじゃない場合
      if (CommonService.isMember(vm.workrest.user.roles) && $scope.isManager) {
        if (!_.contains(vm.rest.user.leaders, $scope.user._id.toString())) {
          $scope.handleShowToast('この休暇をみる権限がありません。', true);
          return $scope.handleBackScreen('home');
        }
      }
      // 本人はマネジャーで現在のユーザーは経理じゃない場合
      if (CommonService.isManager(vm.workrest.user.roles) && ($scope.isManager || $scope.isUser)) {
        $scope.handleShowToast('この休暇をみる権限がありません。', true);
        return $scope.handleBackScreen('home');
      }
      // 本人は経理で現在のユーザーは経理じゃない場合
      if (CommonService.isAccountant(vm.workrest.user.roles) && !($scope.isAccountant || $scope.isAdmin)) {
        $scope.handleShowToast('この休暇をみる権限がありません。', true);
        return $scope.handleBackScreen('home');
      }
    }
    function prepareNotification() {
      if ($stateParams.notif) {
        Notifications.remove($stateParams.notif);
      }
    }
    function prepareCalendar() {
      vm.calendar = { view: 'month' };
      vm.calendar.viewDate = moment(vm.workrest.start).startOf('month').toDate();
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
        if (cell.date.isBetween(vm.workrest.start, vm.workrest.end, null, '[]')) {
          cell.cssClass = 'selected-cell';
          return;
        }
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
    vm.handleApproveWorkrest = function () {
      $scope.handleShowConfirm({
        message: 'この休暇を承認しますか？'
      }, function () {
        WorkrestsAdminApi.approve(vm.workrest._id)
          .success(function (workrest) {
            _.extend(vm.workrest, workrest);
            Socket.emit('rest_review', { workrestId: vm.workrest._id, user: $scope.user._id });
          })
          .error(function (err) {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    vm.handleRejectWorkrest = function () {
      $scope.handleShowConfirm({
        message: 'この休暇を拒否しますか？'
      }, function () {
        WorkrestsAdminApi.reject(vm.workrest._id)
          .success(function (workrest) {
            _.extend(vm.workrest, workrest);
          })
          .error(function (err) {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    vm.handleDeleteWorkrest = function () {
      $scope.handleShowConfirm({
        message: '休暇を取り消しますか？'
      }, function () {
        var rsRest = new WorkrestsService({ _id: vm.workrest._id });
        rsRest.$remove(function () {
          $scope.handleBackScreen('admin.workrests.reviews');
        });
      });
    };
  }
}());
