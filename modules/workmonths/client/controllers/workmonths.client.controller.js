(function () {
  'use strict';

  // Workmonths controller
  angular
    .module('workmonths')
    .controller('WorkmonthsController', WorkmonthsController);

  WorkmonthsController.$inject = ['$scope', '$state', '$window', 'workmonthResolve', 'WorkdatesApi', 'ngDialog', 'WorkmonthsApi'];

  function WorkmonthsController($scope, $state, $window, workmonth, WorkdatesApi, ngDialog, WorkmonthsApi) {
    var vm = this;

    vm.workmonth = workmonth;
    vm.currentMonth = moment().year(vm.workmonth.year).month(vm.workmonth.month - 1);

    vm.isShowHistory = false;

    onCreate();
    function onCreate() {
      prepareShowingData();
    }
    function prepareShowingData() {
      vm.workmonth.workdates.forEach(workdate => {
        workdate.time = moment().year(workdate.year).month(workdate.month - 1).date(workdate.date);
      });
    }

    // Xem các đơn xin nghỉ trong 1 ngày
    vm.handleViewWorkrest = workdate => {
      WorkdatesApi.getWorkrestsInWorkdate(workdate._id)
        .success(res => {
          $scope.workrests = res;
          $scope.time = workdate.time;
          var mDialog = ngDialog.open({
            template: 'workrests_list.html',
            scope: $scope
          });
          mDialog.closePromise.then(function (res) {
            delete $scope.workrests;
            delete $scope.time;
          });
        })
        .error(err => {
          $scope.handleShowToast(err.message, true);
        });
    };
    // Đến màn hình chỉnh sửa workdate
    vm.handleEditWorkDate = workdate => {
      if (!workdate || !workdate._id) return;
      $state.go('workdates.view', { workdateId: workdate._id });
    };
    // Về màn hình xem workmonth theo năm hiện tại
    vm.handleViewYear = () => {
      $state.go('workmonths.list', { year: vm.workmonth.year });
    };
    // Gửi yêu cầu phê duyệt workmonth
    vm.handleSendRequestMonth = () => {
      $scope.handleShowConfirm({
        message: '勤務表を申請しますか？'
      }, () => {
        WorkmonthsApi.request(vm.workmonth._id)
          .success(data => {
            _.extend(vm.workmonth, data);
            Socket.emit('month_request', { workmonthId: vm.workmonth._id, userId: $scope.user._id });
          })
          .error(err => {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    // Hủy yêu cầu phê duyệt workmonth
    vm.handleCancelRequestMonth = () => {
      $scope.handleShowConfirm({
        message: '勤務表の申請を取り消しますか？'
      }, () => {
        WorkmonthsApi.cancel(vm.workmonth._id)
          .success(data => {
            _.extend(vm.workmonth, data);
          })
          .error(err => {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    vm.handleViewHistory = rest => {
      vm.isShowHistory = true;
    };
    vm.handleCloseHistory = () => {
      vm.isShowHistory = false;
    };
    // Xóa workmonth
    vm.handleDeleteMonth = () => {
      $scope.handleShowConfirm({
        message: '勤務表を削除しますか？'
      }, () => {
        vm.workmonth.$remove(vm.handleViewYear());
      });
    };
    vm.handlePreviousScreen = handlePreviousScreen;
    function handlePreviousScreen() {
      $state.go($state.previous.state.name || 'workmonths.list', $state.previous.params);
    }
  }


}());
