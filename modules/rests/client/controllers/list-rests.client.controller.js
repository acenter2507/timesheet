(function () {
  'use strict';

  angular
    .module('rests')
    .controller('RestsListController', RestsListController);

  RestsListController.$inject = ['RestsService'];

  function RestsListController(RestsService) {
    var vm = this;

    vm.rests = RestsService.query();
  }
}());
