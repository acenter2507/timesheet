(function () {
  'use strict';

  // Departments controller
  angular
    .module('departments.admin')
    .controller('ManagerDepartmentController', ManagerDepartmentController);

  ManagerDepartmentController.$inject = [
    '$scope',
    '$state',
    'departmentResolve',
    'ManagerDepartmentsApi',
    'CommonService',
    '$q'
  ];

  function ManagerDepartmentController($scope, $state, department, ManagerDepartmentsApi, CommonService, $q) {
    var vm = this;

    vm.department = department;
    vm.form = {};
    vm.new_members = [];

    onCreate();
    function onCreate() {
    }

    function prepareParams() {
    }

    vm.handleSearchUsers = function ($query) {
      if (CommonService.isStringEmpty($query)) {
        return [];
      }

      var deferred = $q.defer();
      CommonService.autocompleteUsers({ key: $query })
        .success(function (users) {
          deferred.resolve(users);
        });

      return deferred.promise;
    };
    vm.handleAddMember = function () {
      if (vm.new_members.length === 0) return;
      var users = _.pluck(vm.new_members, '_id');
      ManagerDepartmentsApi.addMember(vm.department._id, users)
        .success(function (department) {
          vm.new_members = [];
          _.extend(vm.department, department);
          $scope.handleShowToast('メンバーを追加しました！', false);
        })
        .error(function (err) {
          $scope.handleShowToast(err.message, true);
        });
    };
    vm.handleCancelAddMember = function () {
      vm.new_members = [];
    };










    // // Remove existing Department
    // vm.handleDeleteDepartment = function () {
    //   $scope.handleShowConfirm({
    //     message: vm.department.name + 'を削除しますか？'
    //   }, function () {
    //     vm.department.$remove(function () {
    //       $state.go('departments.list');
    //     });
    //   });
    // };
    // // Send message to all member
    // vm.handleSendMessageDepartment = function () {
    //   $scope.handleShowToast('只今、この機能は作成中です。');
    // };
    // // Send message to all leader
    // vm.handleSendMessageLeader = function () {
    //   $scope.handleShowToast('只今、この機能は作成中です。');
    // };
    // // Send message to all member
    // vm.handleSendMessageMember = function () {
    //   $scope.handleShowToast('只今、この機能は作成中です。');
    // };
    // // Send message to only user
    // vm.handleSendMessageUser = function (user) {
    //   $scope.handleShowToast('只今、この機能は作成中です。');
    // };
    // // Remove member from department
    // vm.handleRemoveUserFromDepartment = function (user) {
    //   $scope.handleShowConfirm({
    //     message: user.displayName + 'を部署から削除しますか？'
    //   }, function () {
    //     vm.department.leaders = _.without(vm.department.leaders, user);
    //     vm.department.members = _.without(vm.department.members, user);
    //     DepartmentsApi.removeUser(vm.department._id, user._id);
    //   });
    // };
    // // Logic remove user
    // vm.handleLogicDeleteUser = function (user) {
    //   $scope.handleShowConfirm({
    //     message: user.displayName + 'を削除しますか？'
    //   }, function () {
    //     var rsUser = new AdminUserService({ _id: user._id });
    //     rsUser.status = 3;
    //     rsUser.$update(function () {
    //       vm.department.leaders = _.without(vm.department.leaders, user);
    //       vm.department.members = _.without(vm.department.members, user);
    //       DepartmentsApi.removeUser(vm.department._id, user._id);
    //     });
    //   });
    // };
    // // Physico remove user
    // vm.handleDatabaseDeleteUser = function (user) {
    //   $scope.handleShowConfirm({
    //     message: user.displayName + 'を完全削除しますか？'
    //   }, function () {
    //     var rsUser = new AdminUserService({ _id: user._id });
    //     vm.department.leaders = _.without(vm.department.leaders, user);
    //     vm.department.members = _.without(vm.department.members, user);
    //     rsUser.$remove();
    //   });
    // };
    // // Add new leader
    // vm.handleStartSearchMember = function () {
    //   angular.element('body').toggleClass('open-left-aside');
    // };
    // // Add a user to department
    // vm.handleAddUserToDepartment = function (member) {
    //   $scope.handleShowConfirm({
    //     message: member.displayName + 'を' + vm.department.name + 'に追加しますか？'
    //   }, function () {
    //     DepartmentsApi.addMemberToDepartment(vm.department._id, member._id)
    //       .success(function (user) {
    //         if (CommonService.isManager(user.roles)) {
    //           vm.department.leaders.push(user);
    //         } else {
    //           vm.department.members.push(user);
    //         }
    //         vm.searchResult = _.without(vm.searchResult, member);
    //         if (!$scope.$$phase) $scope.$digest();
    //       })
    //       .error(function (err) {
    //         $scope.handleShowToast(err.message, true);
    //       });
    //   });
    // };
    // vm.closeLeftAside = function () {
    //   angular.element('body').removeClass('open-left-aside');
    // };
    // /**
    //  * HANDLES
    //  */
    // vm.handleSearchChanged = function () {
    //   if (vm.searchKey === '') return;
    //   if (vm.searchTimer) {
    //     $timeout.cancel(vm.searchTimer);
    //     vm.searchTimer = undefined;
    //   }
    //   vm.searchTimer = $timeout(handleSearchUser, 500);
    // };
    // // vm.handleLeaderSelected = function (leader) {
    // //   var item = _.findWhere(vm.department.leaders, { _id: leader._id });
    // //   if (!item) {
    // //     vm.department.leaders.push(leader);
    // //   }
    // //   vm.searchLeaders = _.without(vm.searchLeaders, leader);
    // //   vm.isShowLeaderDropdown = true;
    // //   if (!$scope.$$phase) $scope.$digest();
    // // };
    // // vm.handleLeaderRemoved = function(leader) {
    // //   vm.department.leaders = _.without(vm.department.leaders, leader);
    // // };
    // function handleSearchUser() {
    //   if (vm.isSearching) return;
    //   vm.isSearching = true;
    //   CommonService.autocompleteUsers({ key: vm.searchKey, noDepartment: true })
    //     .success(function (users) {
    //       vm.searchResult = users;
    //       vm.isSearching = false;
    //       if (!$scope.$$phase) $scope.$digest();
    //     })
    //     .error(function (err) {
    //       $scope.handleShowToast(err.message, true);
    //       vm.isSearching = false;
    //     });
    // }
  }
}());
