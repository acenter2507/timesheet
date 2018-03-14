(function () {
  'use strict';

  angular
    .module('workrests')
    .controller('WorkrestsListController', WorkrestsListController);

  WorkrestsListController.$inject = ['WorkrestsService'];

  function WorkrestsListController(WorkrestsService) {
    var vm = this;

    vm.workrests = WorkrestsService.query();
  }
}());
