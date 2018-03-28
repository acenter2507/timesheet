(function () {
  'use strict';

  angular
    .module('workmonths')
    .controller('WorkmonthsListController', WorkmonthsListController);

  WorkmonthsListController.$inject = ['WorkmonthsService', '$scope', '$state', 'DateUtil', '$stateParams', 'CommonService', 'WorkmonthsApi'];

  function WorkmonthsListController(WorkmonthsService, $scope, $state, DateUtil, $stateParams, CommonService, WorkmonthsApi) {
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
        .success(res => {
          prepareShowingData(res);
        })
        .error(err => {
          $scope.handleShowToast(err.message, true);
        });
    }
    function prepareShowingData(datas) {
      for (var index = 1; index <= 12; index++) {
        var month = _.findWhere(datas, { month: index });
        vm.workmonths.push({ index: index, month: month });
      }
    }

    vm.handleNextYear = () => {
      var lastYear = vm.currentYear.clone().subtract(1, 'years');
      $state.go('workmonths.list', { year: lastYear.year() });
    };
    vm.handlePreviousYear = () => {
      var nextYear = vm.currentYear.clone().add(1, 'years');
      $state.go('workmonths.list', { year: nextYear.year() });
    };
    vm.handleCurrentYear = () => {
      var current = moment(new Date(), 'YYYY');
      $state.go('workmonths.list', { year: current.year() });
    };
  }
}());
