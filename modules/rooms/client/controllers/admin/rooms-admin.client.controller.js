(function () {
  'use strict';

  angular
    .module('rooms.admin')
    .controller('RoomsAdminController', RoomsAdminController);

  RoomsAdminController.$inject = ['$scope', '$state', 'RoomsService'];

  function RoomsAdminController($scope, $state, RoomsService) {
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
