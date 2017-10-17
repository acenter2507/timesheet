(function () {
  'use strict';

  // Departments controller
  angular
    .module('departments')
    .controller('DepartmentsController', DepartmentsController);

  DepartmentsController.$inject = ['$scope', '$state', 'departmentResolve', '$timeout', 'AdminUserApi', '$stateParams', 'DepartmentsApi', 'CommonService'];

  function DepartmentsController($scope, $state, department, $timeout, AdminUserApi, $stateParams, DepartmentsApi, CommonService) {
    var vm = this;

    vm.department = department;
    vm.form = {};

    onCreate();
    function onCreate() {
      if (!vm.department._id) {
        $scope.handleShowToast('部署が存在しません。', true);
        handlePreviousScreen();
        return;
      }
      // vm.isShowLeaderDropdown = false;
      // vm.leaderSearchKey = '';
      // vm.leaderSearching = false;
      // vm.leaderFocus = false;

      // vm.isShowMemberDropdown = false;
      // vm.memberSearchKey = '';
      // vm.memberSearching = false;
      // vm.memberFocus = false;
      prepareParams();
    }

    function prepareParams() {
    }
    // Remove existing Department
    vm.handleDeleteDepartment = () => {
      $scope.handleShowConfirm({
        message: vm.department.name + 'を削除しますか？'
      }, () => {
        vm.department.$remove(() => {
          $state.go('departments.list');
        });
      });
    };
    // Send message to all member
    vm.handleSendMessageDepartment = () => {
      $scope.handleShowToast('只今、この機能は作成中です。');
    };
    // Send message to all leader
    vm.handleSendMessageLeader = () => {
      $scope.handleShowToast('只今、この機能は作成中です。');
    };
    // Send message to all member
    vm.handleSendMessageMember = () => {
      $scope.handleShowToast('只今、この機能は作成中です。');
    };
    // Send message to only user
    vm.handleSendMessageUser = user => {
      $scope.handleShowToast('只今、この機能は作成中です。');
    };
    // Add new leader
    vm.handleAddLeader = () => { };
    // Add new leader
    vm.handleAddMember = () => { };
    // View user detail page
    vm.handleViewDetailUser = user => {
      if ($scope.isAdmin || $scope.isAccountant) {
        return $state.go('users.view', { userId: user._id });
      } else {
        return $state.go('profile.view', { userId: user._id });
      }
    };
    // Remove member from department
    vm.handleRemoveUserFromDepartment = user => {
      $scope.handleShowConfirm({
        message: user.displayName + 'を部署から削除しますか？'
      }, () => {
        if (CommonService.checkUserIsManager(user.roles)) {
          vm.department.leaders = _.without(vm.department.leaders, user);
        } else {
          vm.department.members = _.without(vm.department.members, user);
        }
        DepartmentsApi.removeUser(vm.department._id, user._id);
        if (!$scope.$$phase) $scope.$digest();
      });
    };
    // Logic remove user
    vm.handleLogicDeleteUser = user => { };
    // Physico remove user
    vm.handleDatabaseDeleteUser = user => { };
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
    // Trở về màn hình trước
    function handlePreviousScreen() {
      $state.go($state.previous.state.name || 'departments.list', $state.previous.params);
    }
  }
}());
