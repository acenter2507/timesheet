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
      vm.isShowLeaderDropdown = false;
      vm.leaderSearchKey = '';
      vm.leaderSearching = false;

      vm.isShowMemberDropdown = false;
      vm.memberSearchKey = '';
      vm.memberSearching = false;
      if (!vm.department._id) {
        vm.department.members = [];
        vm.department.leaders = [];
      }
    }
    // Remove existing Department
    vm.handleDeleteDepartment = () => {
      $scope.handleShowConfirm({
        message: vm.department.name + 'を削除しますか？'
      });
      // if ($window.confirm('Are you sure you want to delete?')) {
      //   vm.department.$remove($state.go('departments.list'));
      // }
    };

    // Save Department
    vm.handleSaveDepartment = isValid => {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.departmentForm');
        return false;
      }

      var leaderIds = _.pluck(vm.department.leaders, '_id');
      var memberIds = _.pluck(vm.department.members, '_id');

      vm.department.leaders = leaderIds;
      vm.department.members = memberIds;

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
        $scope.handleShowToast(res.data.message, true);
      }
    };

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
      var item = _.findWhere(vm.department.leaders, { _id: leader._id });
      if (!item) {
        vm.department.leaders.push(leader);
      }
      vm.searchLeaders = _.without(vm.searchLeaders, leader);
      vm.isShowLeaderDropdown = true;
      if (!$scope.$$phase) $scope.$digest();
    };
    vm.handleLeaderRemoved = (leader) => {
      vm.department.leaders = _.without(vm.department.leaders, leader);
    };
    function handleStartSearchLeaders() {
      if (vm.leaderSearching) return;
      vm.leaderSearching = true;
      vm.isShowLeaderDropdown = true;
      var leaders = _.pluck(vm.department.leaders, '_id').join();
      AdminUserApi.searchUsers(vm.leaderSearchKey, leaders, ['manager'])
        .success(users => {
          vm.searchLeaders = users;
          vm.leaderSearching = false;
          if (!$scope.$$phase) $scope.$digest();
        })
        .error(err => {
          $scope.handleShowToast(err.message, true);
          vm.isShowLeaderDropdown = false;
          vm.leaderSearching = false;
        });
    }

    vm.handleMemberInputChanged = () => {
      if (vm.memberSearchKey === '') return;
      if (vm.memberSearchTimer) {
        $timeout.cancel(vm.memberSearchTimer);
        vm.memberSearchTimer = undefined;
      }
      vm.memberSearchTimer = $timeout(handleStartSearchMembers, 500);
    };
    vm.handleMemberSelected = (member) => {
      var item = _.findWhere(vm.department.members, { _id: member._id });
      if (!item) {
        vm.department.members.push(member);
      }
      vm.searchMembers = _.without(vm.searchMembers, member);
      vm.isShowMemberDropdown = true;
      if (!$scope.$$phase) $scope.$digest();
    };
    vm.handleMemberRemoved = (member) => {
      vm.department.members = _.without(vm.department.members, member);
    };
    function handleStartSearchMembers() {
      if (vm.memberSearching) return;
      vm.memberSearching = true;
      vm.isShowMemberDropdown = true;
      var ignore = '';
      var leaders = _.pluck(vm.department.leaders, '_id').join();
      var members = _.pluck(vm.department.members, '_id').join();
      if (members && members.length > 0) {
        if (leaders && leaders.length > 0) {
          ignore = leaders + ',' + members;
        } else {
          ignore = members;
        }
      } else {
        if (leaders && leaders.length > 0) {
          ignore = leaders;
        } else {
          ignore = '';
        }
      }
      AdminUserApi.searchUsers(vm.memberSearchKey, ignore, [])
        .success(users => {
          vm.searchMembers = users;
          vm.memberSearching = false;
          if (!$scope.$$phase) $scope.$digest();
        })
        .error(err => {
          $scope.handleShowToast(err.message, true);
          vm.isShowMemberDropdown = false;
          vm.memberSearching = false;
        });
    }
  }
}());
