(function () {
  'use strict';

  // Departments controller
  angular
    .module('departments')
    .controller('DepartmentsController', DepartmentsController);

  DepartmentsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'departmentResolve'];

  function DepartmentsController($scope, $state, $window, Authentication, department) {
    var vm = this;

    vm.department = department;
    vm.form = {};

    // Remove existing Department
    vm.remove = remove;
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.department.$remove($state.go('departments.list'));
      }
    }

    // Save Department
    vm.save = save;
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.departmentForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.department._id) {
        vm.department.$update(successCallback, errorCallback);
      } else {
        vm.department.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('departments.view', {
          departmentId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }

    /**
     * HANDLES
     */
    vm.handleAddLeader = () => { };
    vm.handleAddMember = () => { };
  }
}());
