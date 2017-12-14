(function () {
  'use strict';

  // Departments controller
  angular
    .module('departments')
    .controller('DepartmentsController', DepartmentsController);

  DepartmentsController.$inject = [
    '$scope',
    '$state',
    'departmentResolve',
    '$timeout',
    'AdminUserApi',
    '$stateParams',
    'DepartmentsApi',
    'CommonService',
    'AdminUserService'
  ];

  function DepartmentsController($scope, $state, department, $timeout, AdminUserApi, $stateParams, DepartmentsApi, CommonService, AdminUserService) {
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
      vm.isSearching = false;
      vm.searchKey = '';
      vm.searchResult = [];

      prepareParams();
      $scope.$on('$destroy', function () {
        angular.element('body').removeClass('open-left-aside');
      });
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
        vm.department.leaders = _.without(vm.department.leaders, user);
        vm.department.members = _.without(vm.department.members, user);
        DepartmentsApi.removeUser(vm.department._id, user._id);
      });
    };
    // Logic remove user
    vm.handleLogicDeleteUser = user => {
      $scope.handleShowConfirm({
        message: user.displayName + 'を削除しますか？'
      }, () => {
        var rsUser = new AdminUserService({ _id: user._id });
        rsUser.status = 3;
        rsUser.$update(() => {
          vm.department.leaders = _.without(vm.department.leaders, user);
          vm.department.members = _.without(vm.department.members, user);
          DepartmentsApi.removeUser(vm.department._id, user._id);
        });
      });
    };
    // Physico remove user
    vm.handleDatabaseDeleteUser = user => {
      $scope.handleShowConfirm({
        message: user.displayName + 'を完全削除しますか？'
      }, () => {
        var rsUser = new AdminUserService({ _id: user._id });
        vm.department.leaders = _.without(vm.department.leaders, user);
        vm.department.members = _.without(vm.department.members, user);
        rsUser.$remove();
      });
    };
    // Add new leader
    vm.handleStartSearchMember = () => {
      angular.element('body').toggleClass('open-left-aside');
    };
    // Add a user to department
    vm.handleAddUserToDepartment = member => {
      $scope.handleShowConfirm({
        message: member.displayName + 'を' + vm.department.name + 'に追加しますか？'
      }, () => {
        DepartmentsApi.addMemberToDepartment(vm.department._id, member._id)
          .success(user => {
            if (CommonService.isManager(user.roles)) {
              vm.department.leaders.push(user);
            } else {
              vm.department.members.push(user);
            }
            vm.searchResult = _.without(vm.searchResult, member);
            if (!$scope.$$phase) $scope.$digest();
          })
          .error(err => {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    vm.closeLeftAside = () => {
      angular.element('body').removeClass('open-left-aside');
    };
    /**
     * HANDLES
     */
    vm.handleSearchChanged = () => {
      if (vm.searchKey === '') return;
      if (vm.searchTimer) {
        $timeout.cancel(vm.searchTimer);
        vm.searchTimer = undefined;
      }
      vm.searchTimer = $timeout(handleSearchUser, 500);
    };
    // vm.handleLeaderSelected = (leader) => {
    //   var item = _.findWhere(vm.department.leaders, { _id: leader._id });
    //   if (!item) {
    //     vm.department.leaders.push(leader);
    //   }
    //   vm.searchLeaders = _.without(vm.searchLeaders, leader);
    //   vm.isShowLeaderDropdown = true;
    //   if (!$scope.$$phase) $scope.$digest();
    // };
    // vm.handleLeaderRemoved = (leader) => {
    //   vm.department.leaders = _.without(vm.department.leaders, leader);
    // };
    function handleSearchUser() {
      if (vm.isSearching) return;
      vm.isSearching = true;
      AdminUserApi.searchUsers(vm.searchKey)
        .success(users => {
          vm.searchResult = users;
          vm.isSearching = false;
          if (!$scope.$$phase) $scope.$digest();
        })
        .error(err => {
          $scope.handleShowToast(err.message, true);
          vm.isSearching = false;
        });
    }
    // Trở về màn hình trước
    function handlePreviousScreen() {
      $state.go($state.previous.state.name || 'departments.list', $state.previous.params);
    }
  }
}());
