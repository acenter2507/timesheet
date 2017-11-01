(function () {
  'use strict';

  // Holidays controller
  angular
    .module('holidays')
    .controller('HolidaysController', HolidaysController);

  HolidaysController.$inject = ['$scope', '$state', '$window', 'Authentication', 'holidayResolve'];

  function HolidaysController ($scope, $state, $window, Authentication, holiday) {
    var vm = this;

    vm.authentication = Authentication;
    vm.holiday = holiday;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Holiday
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.holiday.$remove($state.go('holidays.list'));
      }
    }

    // Save Holiday
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.holidayForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.holiday._id) {
        vm.holiday.$update(successCallback, errorCallback);
      } else {
        vm.holiday.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('holidays.view', {
          holidayId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
