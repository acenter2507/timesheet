(function () {
  'use strict';

  angular
    .module('months')
    .controller('MonthsListController', MonthsListController);

  MonthsListController.$inject = ['MonthsService'];

  function MonthsListController(MonthsService) {
    var vm = this;

    vm.months = MonthsService.query();
  }
}());
