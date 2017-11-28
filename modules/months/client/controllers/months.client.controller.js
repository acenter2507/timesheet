(function () {
  'use strict';

  // Months controller
  angular
    .module('months')
    .controller('MonthsController', MonthsController);

  MonthsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'monthResolve'];

  function MonthsController ($scope, $state, $window, Authentication, month) {
    var vm = this;

    vm.authentication = Authentication;
    vm.month = month;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Month
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.month.$remove($state.go('months.list'));
      }
    }

    // Save Month
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.monthForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.month._id) {
        vm.month.$update(successCallback, errorCallback);
      } else {
        vm.month.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('months.view', {
          monthId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
