(function () {
  'use strict';

  // Rests controller
  angular
    .module('rests')
    .controller('RestsController', RestsController);

  RestsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'restResolve'];

  function RestsController ($scope, $state, $window, Authentication, rest) {
    var vm = this;

    vm.authentication = Authentication;
    vm.rest = rest;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Rest
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.rest.$remove($state.go('rests.list'));
      }
    }

    // Save Rest
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.restForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.rest._id) {
        vm.rest.$update(successCallback, errorCallback);
      } else {
        vm.rest.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('rests.view', {
          restId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
