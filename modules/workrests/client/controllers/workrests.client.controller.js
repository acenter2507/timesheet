(function () {
  'use strict';

  // Workrests controller
  angular
    .module('workrests')
    .controller('WorkrestsController', WorkrestsController);

  WorkrestsController.$inject = ['$scope', '$state', 'workrestResolve', 'CommonService', 'DateUtil', 'WorkrestsApi', 'ngDialog', 'Socket', '$stateParams', 'Notifications'];

  function WorkrestsController ($scope, $state, workrest, CommonService, DateUtil, WorkrestsApi, ngDialog, Socket, $stateParams, Notifications) {
    var vm = this;
    vm.workrest = workrest;

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
        $scope.handleShowToast('権限が必要です。', true);
        return handlePreviousScreen();
      }
      // 休暇の本人のリーダじゃない場合
      if (CommonService.isMember(vm.workrest.user.roles) && $scope.isManager) {
        if (!_.contains(vm.rest.user.leaders, $scope.user._id.toString())) {
          $scope.handleShowToast('この休暇をみる権限がありません。', true);
          return handlePreviousScreen();
        }
      }
      // 本人はマネジャーで現在のユーザーは経理じゃない場合
      if (CommonService.isManager(vm.workrest.user.roles) && ($scope.isManager || $scope.isUser)) {
        $scope.handleShowToast('この休暇をみる権限がありません。', true);
        return handlePreviousScreen();
      }
      // 本人は経理で現在のユーザーは経理じゃない場合
      if (CommonService.isAccountant(vm.workrest.user.roles) && !($scope.isAccountant || $scope.isAdmin)) {
        $scope.handleShowToast('この休暇をみる権限がありません。', true);
        return handlePreviousScreen();
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
    vm.handleDeleteRest = () => {
      $scope.handleShowConfirm({
        message: '休暇登録を削除しますか？'
      }, () => {
        vm.workrest.$remove(handlePreviousScreen());
      });
    };
    vm.handleSendRequestRest = () => {
      $scope.handleShowConfirm({
        message: '休暇を申請しますか？'
      }, () => {
        WorkrestsApi.request(vm.workrest._id)
          .success(data => {
            _.extend(vm.workrest, data);
            Socket.emit('rest_request', { workrestId: vm.workrest._id, userId: $scope.user._id });
          })
          .error(err => {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    vm.handleApproveRest = () => {
      $scope.handleShowConfirm({
        message: 'この休暇を承認しますか？'
      }, () => {
        WorkrestsApi.approve(vm.workrest._id)
          .success(data => {
            _.extend(vm.workrest, data);
            Socket.emit('rest_review', { workrestId: vm.workrest._id, user: $scope.user._id });
          })
          .error(err => {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    vm.handleRejectRest = () => {
      ngDialog.openConfirm({
        templateUrl: 'commentTemplate.html',
        scope: $scope
      }).then(comment => {
        delete $scope.comment;
        $scope.handleShowConfirm({
          message: 'この休暇を拒否しますか？'
        }, () => {
          WorkrestsApi.reject(vm.workrest._id, { comment: comment })
            .success(data => {
              _.extend(vm.workrest, data);
              Socket.emit('rest_review', { workrestId: vm.workrest._id, user: $scope.user._id });
            })
            .error(err => {
              $scope.handleShowToast(err.message, true);
            });
        });
      }, () => {
        delete $scope.comment;
      });

    };
    // View user detail page
    vm.handleViewDetailUser = user => {
      if ($scope.isAdmin || $scope.isAccountant) {
        return $state.go('users.view', { userId: user._id });
      } else {
        return $state.go('profile.view', { userId: user._id });
      }
    };
    // Trở về màn hình trước
    function handlePreviousScreen() {
      $state.go($state.previous.state.name || 'home', $state.previous.params);
    }
  }
}());
