(function () {
  'use strict';

  // Rests controller
  angular
    .module('rests')
    .controller('RestsController', RestsController);

  RestsController.$inject = ['$scope', '$state', 'restResolve', 'CommonService', 'DateUtil', 'RestsApi', 'ngDialog'];

  function RestsController($scope, $state, rest, CommonService, DateUtil, RestsApi, ngDialog) {
    var vm = this;
    vm.rest = rest;

    onCreate();
    function onCreate() {
      prepareSecurity();
      prepareCalendar();
    }
    function prepareSecurity() {
      // 自分の休暇
      if (vm.rest.isCurrentUserOwner) return;
      // 他人の休暇で自分がリーダじゃない場合
      if (!vm.rest.isCurrentUserOwner && !$scope.isLeader) {
        $scope.handleShowToast('権限が必要です。', true);
        return handlePreviousScreen();
      }
      // 休暇の本人のリーダじゃない場合
      if (CommonService.isMember(vm.rest.user.roles) && $scope.isManager) {
        if (!_.contains(vm.rest.user.leaders, $scope.user._id.toString())) {
          $scope.handleShowToast('この休暇をみる権限がありません。', true);
          return handlePreviousScreen();
        }
      }
      // 本人はマネジャーで現在のユーザーは経理じゃない場合
      if (CommonService.isManager(vm.rest.user.roles) && ($scope.isManager || $scope.isUser)) {
        $scope.handleShowToast('この休暇をみる権限がありません。', true);
        return handlePreviousScreen();
      }
      // 本人は経理で現在のユーザーは経理じゃない場合
      if (CommonService.isAccountant(vm.rest.user.roles) && !($scope.isAccountant || $scope.isAdmin)) {
        $scope.handleShowToast('この休暇をみる権限がありません。', true);
        return handlePreviousScreen();
      }
    }
    function prepareCalendar() {
      vm.calendar = { view: 'month' };
      vm.calendar.viewDate = moment(vm.rest.start).startOf('month').toDate();
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
        if (cell.date.isBetween(vm.rest.start, vm.rest.end, null, '[]')) {
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
        vm.rest.$remove(handlePreviousScreen());
      });
    };
    vm.handleSendRequestRest = () => {
      $scope.handleShowConfirm({
        message: '休暇を申請しますか？'
      }, () => {
        RestsApi.request(vm.rest._id)
          .success(data => {
            _.extend(vm.rest, data);
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
        RestsApi.approve(vm.rest._id)
          .success(data => {
            _.extend(vm.rest, data);
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
          RestsApi.reject(vm.rest._id, { comment: comment })
            .success(data => {
              _.extend(vm.rest, data);
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
