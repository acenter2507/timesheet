(function () {
  'use strict';

  angular
    .module('holidays')
    .controller('HolidaysListController', HolidaysListController);

  HolidaysListController.$inject = ['HolidaysService'];

  function HolidaysListController(HolidaysService) {
    var vm = this;

    vm.holidays = HolidaysService.query();
  }
}());
