(function () {
  'use strict';

  angular
    .module('months')
    .controller('MonthsListController', MonthsListController);

  MonthsListController.$inject = ['MonthsService', '$scope', '$state', 'DateUtil', '$stateParams'];

  function MonthsListController(MonthsService, $scope, $state, DateUtil, $stateParams) {
    var vm = this;
    vm.busy = false;

    onCreate();
    function onCreate() {
      preapreParams();
    }

    function preapreParams() {
      var param = $stateParams.year;
      if (param) {
        vm.currentYear = moment(param, 'YYYY');
      } else {
        vm.currentYear = moment(new Date(), 'YYYY');
      }
    }

    vm.handleNextYear = () => {
      var lastYear = vm.currentYear.clone().subtract(1, 'years');
      $state.go('months.list', { year: lastYear.format('YYYY') });
    };
    vm.handlePreviousYear = () => {
      var nextYear = vm.currentYear.clone().add(1, 'years');
      $state.go('months.list', { year: nextYear.format('YYYY') });
    };
    vm.handleCurrentYear = () => {
      var current =  moment(new Date(), 'YYYY');
      $state.go('months.list', { year: current.format('YYYY') });
    };
  }
}());
