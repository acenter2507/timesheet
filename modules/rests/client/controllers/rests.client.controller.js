(function () {
  'use strict';

  // Rests controller
  angular
    .module('rests')
    .controller('RestsController', RestsController);

  RestsController.$inject = ['$scope', '$state', 'restResolve', 'CommonService', 'DateUtil', 'RestsApi'];

  function RestsController($scope, $state, rest, CommonService, DateUtil, RestsApi) {
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
      if (CommonService.isUser(vm.rest.user.roles) && $scope.isManager) {
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

    vm.handleChangeRestStatus = status => {
      var message = '';
      switch (status) {
        case 2: { message = '休暇を申請しますか？'; break; }
        case 3: { message = '休暇を承認しますか？'; break; }
        case 4: { message = '休暇を拒否しますか？'; break; }
      }
      $scope.handleShowConfirm({
        message: message
      }, () => {
        console.log('bbb');
      });
    };

    // Remove existing Rest
    // function remove() {
    //   if ($window.confirm('Are you sure you want to delete?')) {
    //     vm.rest.$remove($state.go('rests.list'));
    //   }
    // }

    // Trở về màn hình trước
    function handlePreviousScreen() {
      $state.go($state.previous.state.name || 'home', $state.previous.params);
    }
  }
}());
