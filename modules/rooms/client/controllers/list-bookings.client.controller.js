(function () {
  'use strict';

  angular
    .module('bookings')
    .controller('BookingsListController', BookingsListController);

  BookingsListController.$inject = ['RoomsService'];

  function BookingsListController(RoomsService) {
    var vm = this;

    vm.rooms = RoomsService.query();
  }
}());
