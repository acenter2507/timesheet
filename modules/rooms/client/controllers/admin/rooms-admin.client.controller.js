(function () {
  'use strict';

  angular
    .module('rooms.admin')
    .controller('RoomsAdminController', RoomsAdminController);

  RoomsAdminController.$inject = ['RoomsService', '$state'];

  function RoomsAdminController(RoomsService, $state) {
    var vm = this;
    vm.rooms = RoomsService.query();

    vm.hanleSelectRoom = function (room) {
      $state.go('admin.rooms.view', { roomId: room._id });
    };
    vm.handleDeleteRoom = function (room) {
      $scope.handleShowConfirm({
        message: room.name + 'を削除しますか？'
      }, function () {
        room.$remove(function () {
          vm.rooms = _.without(vm.rooms, room);
        });
      });
    };
  }
}());
