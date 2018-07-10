(function () {
  'use strict';

  angular
    .module('workmonths')
    .controller('WorkmonthsListController', WorkmonthsListController);

  WorkmonthsListController.$inject = ['WorkmonthsService', '$scope', '$state', 'DateUtil', '$stateParams', 'CommonService', 'WorkmonthsApi', 'Socket'];

  function WorkmonthsListController(WorkmonthsService, $scope, $state, DateUtil, $stateParams, CommonService, WorkmonthsApi, Socket) {
    var vm = this;
    vm.createMonthBusy = false;
    vm.isShowHistory = false;

    vm.workmonths = [];

    onCreate();
    function onCreate() {
      prepareParams();
      prepareMonths();
    }

    function prepareParams() {
      var param = $stateParams.year;
      if (param) {
        vm.currentYear = moment(param, 'YYYY');
      } else {
        vm.currentYear = moment();
      }
    }
    function prepareMonths() {
      WorkmonthsApi.getWorkMonthsByYearAndUser(vm.currentYear.year(), $scope.user._id)
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
    vm.handleCreateWorkMonth = function (index) {
      if (vm.createMonthBusy) return;
      vm.createMonthBusy = true;

      var newMonth = new WorkmonthsService({
        year: vm.currentYear.year(),
        month: index
      });
      newMonth.$save(function (res) {
        vm.createMonthBusy = false;
        var oldMonth = _.findWhere(vm.workmonths, { index: index });
        _.extend(oldMonth, { workmonth: res });
      }, function (err) {
        $scope.handleShowToast(err.data.message, true);
        vm.createMonthBusy = false;
      });
    };
    vm.handleSendRequestWorkmonth = function (item) {
      $scope.handleShowConfirm({
        message: item.workmonth.month + '月の勤務表を申請しますか？'
      }, function () {
        WorkmonthsApi.request(item.workmonth._id)
          .success(function (data) {
            _.extend(item.workmonth, data);
            Socket.emit('month_request', { workmonthId: item.workmonth._id, userId: $scope.user._id });
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
    vm.handleViewHistory = function (item) {
      vm.isShowHistory = true;
      vm.historys = item.workmonth.historys;
    };
    vm.handleCloseHistory = function () {
      vm.isShowHistory = false;
    };
  }
}());
