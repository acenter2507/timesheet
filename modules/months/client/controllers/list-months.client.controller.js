(function () {
  'use strict';

  angular
    .module('months')
    .controller('MonthsListController', MonthsListController);

  MonthsListController.$inject = ['MonthsService', '$scope', '$state', 'DateUtil', '$stateParams', 'CommonService', 'MonthsApi'];

  function MonthsListController(MonthsService, $scope, $state, DateUtil, $stateParams, CommonService, MonthsApi) {
    var vm = this;
    vm.datas = [];
    vm.months = [];
    vm.createMonthBusy = false;

    onCreate();
    function onCreate() {
      prepareParams();
      prepareMonths();
      console.log(vm.currentYear.year());
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
      MonthsApi.getMonthsOfYearByUser(vm.currentYear.year(), $scope.user._id)
        .success(res => {
          vm.datas = res;
          console.log(res);
          prepareShowingData();
        })
        .error(err => {
          $scope.handleShowToast(err.message, true);
        });
    }
    function prepareShowingData() {
      for (var index = 1; index <= 12; index++) {
        var month = _.findWhere(vm.datas, { month: index });
        vm.months.push({ index: index, month: month });
      }
    }

    vm.handleNextYear = () => {
      var lastYear = vm.currentYear.clone().subtract(1, 'years');
      $state.go('months.list', { year: lastYear.year() });
    };
    vm.handlePreviousYear = () => {
      var nextYear = vm.currentYear.clone().add(1, 'years');
      $state.go('months.list', { year: nextYear.year() });
    };
    vm.handleCurrentYear = () => {
      var current = moment(new Date(), 'YYYY');
      $state.go('months.list', { year: current.year() });
    };
    vm.handleCreateMonth = index => {
      if (vm.createMonthBusy) return;
      // vm.createMonthBusy = true;

      // var newMonth = new MonthsService({
      //   year: vm.currentYear.format('YYYY')
      // })
    };
    vm.handleSendRequestMonth = month => { };
    vm.handleDeleteMonth = month => { };
    vm.handleViewHistory = month => { };
  }
}());
