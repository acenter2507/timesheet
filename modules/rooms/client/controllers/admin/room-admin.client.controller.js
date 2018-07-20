(function () {
  'use strict';

  // Rooms controller
  angular
    .module('rooms')
    .controller('RoomAdminController', RoomAdminController);

  RoomAdminController.$inject = ['$scope', '$state', '$window', 'roomResolve'];

  function RoomAdminController($scope, $state, $window, room) {
    var vm = this;

    vm.room = room;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Room
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.room.$remove($state.go('rooms.list'));
      }
    }

    // Save Room
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.roomForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.room._id) {
        vm.room.$update(successCallback, errorCallback);
      } else {
        vm.room.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('rooms.view', {
          roomId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
