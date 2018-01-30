(function () {
  'use strict';

  angular
    .module('workdates')
    .controller('WorkdatesListController', WorkdatesListController);

  WorkdatesListController.$inject = ['WorkdatesService'];

  function WorkdatesListController(WorkdatesService) {
    var vm = this;

    vm.workdates = WorkdatesService.query();
  }
}());
