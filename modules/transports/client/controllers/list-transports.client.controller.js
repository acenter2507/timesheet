(function () {
  'use strict';

  angular
    .module('transports')
    .controller('TransportsListController', TransportsListController);

  TransportsListController.$inject = ['TransportsService'];

  function TransportsListController(TransportsService) {
    var vm = this;

    vm.transports = TransportsService.query();
  }
}());
