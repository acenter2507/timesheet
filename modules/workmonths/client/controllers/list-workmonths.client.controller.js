(function () {
  'use strict';

  angular
    .module('workmonths')
    .controller('WorkmonthsListController', WorkmonthsListController);

  WorkmonthsListController.$inject = ['WorkmonthsService'];

  function WorkmonthsListController(WorkmonthsService) {
    var vm = this;

    vm.workmonths = WorkmonthsService.query();
  }
}());
