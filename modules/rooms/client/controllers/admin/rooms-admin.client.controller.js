(function () {
  'use strict';

  angular
    .module('rooms.admin')
    .controller('RoomsAdminController', RoomsAdminController);

  RoomsAdminController.$inject = ['RoomsService'];

  function RoomsAdminController(RoomsService) {
    var vm = this;
    vm.rooms = RoomsService.query();
  }
}());
