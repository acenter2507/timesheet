(function () {
  'use strict';

  angular
    .module('workmonths')
    .controller('WorkmonthsListController', WorkmonthsListController);

  WorkmonthsListController.$inject = ['WorkmonthsService', '$scope', '$state', '$stateParams', 'WorkmonthsApi', 'Socket'];

  function WorkmonthsListController(WorkmonthsService, $scope, $state, $stateParams, WorkmonthsApi, Socket) {
    var vm = this;
    vm.busy = false;
    vm.isShowHistory = false;

    vm.workmonths = [];

    onCreate();
    function onCreate() {
      prepareParams();
      prepareMonths();
    }

    function prepareParams() {
      if ($stateParams.year) {
        vm.currentYear = moment($stateParams.year, 'YYYY');
      } else {
        vm.currentYear = moment();
      }
    }
    function prepareMonths() {
      WorkmonthsApi.list(vm.currentYear.year())
        .success(function (res) {
          prepareShowingData(res);
        })
        .error(function (err) {
          $scope.handleShowToast(err.message, true);
        });
    }
    function prepareShowingData(datas) {
      for (var index = 1; index <= 12; index++) {
        var workmonth = _.findWhere(datas, { month: index });
        vm.workmonths.push({ index: index, workmonth: workmonth });
      }
    }

    vm.handleCreateWorkmonth = function (index) {
      if (vm.busy) return;
      vm.busy = true;

      var newMonth = new WorkmonthsService({
        year: vm.currentYear.year(),
        month: index
      });
      newMonth.$save(function (workmonth) {
        var oldMonth = _.findWhere(vm.workmonths, { index: index });
        _.extend(oldMonth, { workmonth: workmonth });
        vm.busy = false;
      }, function (err) {
        $scope.handleShowToast(err.data.message, true);
        vm.busy = false;
      });
    };
    vm.handleRequestWorkmonth = function (item) {
      $scope.handleShowConfirm({
        message: item.workmonth.month + '月の勤務表を申請しますか？'
      }, function () {
        WorkmonthsApi.request(item.workmonth._id)
          .success(function (workmonth) {
            _.extend(item.workmonth, workmonth);
            Socket.emit('month_request', { workmonthId: item.workmonth._id, userId: $scope.user._id });
          })
          .error(function (err) {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    vm.handleCancelWorkmonth = function (item) {
      $scope.handleShowConfirm({
        message: item.workmonth.month + '月の清算表をキャンセルしますか？'
      }, function () {
        WorkmonthsApi.cancel(item.workmonth._id)
          .success(function (workmonth) {
            _.extend(item.workmonth, workmonth);
          })
          .error(function (err) {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    vm.handleRequestDeleteWorkmonth = function (item) {
      $scope.handleShowConfirm({
        message: item.workmonth.month + '月の清算表を取り消し申請しますか？'
      }, function () {
        WorkmonthsApi.requestDelete(item.workmonth._id)
          .success(function (workmonth) {
            _.extend(item.workmonth, workmonth);
          })
          .error(function (err) {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    vm.handleDeleteWorkmonth = function (item) {
      if (!item.workmonth) return;
      $scope.handleShowConfirm({
        message: item.workmonth.month + '月の勤務表を削除しますか？'
      }, function () {
        var rsMonth = new WorkmonthsService({ _id: item.workmonth._id });
        rsMonth.$remove(function () {
          item.workmonth = undefined;
        });
      });
    };
    vm.handleSelectWorkmonth = function (item) {
      if (!item.workmonth) return false;
      $state.go('workmonths.view', { workmonthId: item.workmonth._id });
    };
    vm.handleViewHistory = function (item) {
      vm.isShowHistory = true;
      vm.historys = item.workmonth.historys;
    };
    vm.handleCloseHistory = function () {
      vm.isShowHistory = false;
    };
    vm.handleNextYear = function () {
      var lastYear = vm.currentYear.clone().subtract(1, 'years');
      $state.go('workmonths.list', { year: lastYear.year() });
    };
    vm.handlePreviousYear = function () {
      var nextYear = vm.currentYear.clone().add(1, 'years');
      $state.go('workmonths.list', { year: nextYear.year() });
    };
    vm.handleCurrentYear = function () {
      var current = moment(new Date(), 'YYYY');
      $state.go('workmonths.list', { year: current.year() });
    };
  }
}());
