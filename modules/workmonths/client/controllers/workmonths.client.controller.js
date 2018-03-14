(function () {
  'use strict';

  // Workmonths controller
  angular
    .module('workmonths')
    .controller('WorkmonthsController', WorkmonthsController);

  WorkmonthsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'workmonthResolve'];

  function WorkmonthsController ($scope, $state, $window, Authentication, workmonth) {
    var vm = this;

    vm.authentication = Authentication;
    vm.workmonth = workmonth;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Workmonth
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.workmonth.$remove($state.go('workmonths.list'));
      }
    }

    // Save Workmonth
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.workmonthForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.workmonth._id) {
        vm.workmonth.$update(successCallback, errorCallback);
      } else {
        vm.workmonth.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('workmonths.view', {
          workmonthId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
