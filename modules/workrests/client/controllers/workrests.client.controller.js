(function () {
  'use strict';

  // Workrests controller
  angular
    .module('workrests')
    .controller('WorkrestsController', WorkrestsController);

  WorkrestsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'workrestResolve'];

  function WorkrestsController ($scope, $state, $window, Authentication, workrest) {
    var vm = this;

    vm.authentication = Authentication;
    vm.workrest = workrest;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Workrest
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.workrest.$remove($state.go('workrests.list'));
      }
    }

    // Save Workrest
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.workrestForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.workrest._id) {
        vm.workrest.$update(successCallback, errorCallback);
      } else {
        vm.workrest.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('workrests.view', {
          workrestId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
