(function () {
  'use strict';

  // Departments controller
  angular
    .module('departments')
    .controller('DepartmentsController', DepartmentsController);

  DepartmentsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'departmentResolve', '$timeout', 'AdminUserApi'];

  function DepartmentsController($scope, $state, $window, Authentication, department, $timeout, AdminUserApi) {
    var vm = this;

    vm.department = department;
    vm.form = {};

    onCreate();
    function onCreate() {
      vm.isShowLeaderSearch = false;
      vm.isShowMemberSearch = false;
      vm.isShowLeaderDropdown = false;
      vm.leaderSearchKey = '';
      vm.leaderSearching = false;
    }
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
    vm.handleLeaderInputChanged = () => {
      if (vm.leaderSearchKey === '') return;
      if (vm.leaderSearchTimer) {
        $timeout.cancel(vm.leaderSearchTimer);
        vm.leaderSearchTimer = undefined;
      }
      vm.leaderSearchTimer = $timeout(handleStartSearchLeaders, 500);
    };

    vm.handleLeaderSelected = (leader) => {
      console.log(leader);
    }
    function handleStartSearchLeaders() {
      if (vm.leaderSearching) return;
      vm.leaderSearching = true;
      var leaders = _.pluck(vm.department.leaders, '_id').join();
      AdminUserApi.searchUsers(vm.leaderSearchKey, leaders)
        .success(users => {
          vm.searchLeaders = users;
          vm.isShowLeaderDropdown = true;
          vm.leaderSearching = false;
          if (!$scope.$$phase) $scope.$digest();
        })
        .error(err => {
          $scope.handleShowToast(err.message, true);
          vm.isShowLeaderDropdown = false;
          vm.leaderSearching = false;
        });
    }


    vm.handleAddMember = () => { };
  }
}());
