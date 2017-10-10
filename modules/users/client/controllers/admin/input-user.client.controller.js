'use strict';

angular.module('users.admin').controller('UserInputController', ['$scope', '$state', 'userResolve', 'DepartmentsService', '$timeout', 'AdminUserApi',
  function ($scope, $state, userResolve, DepartmentsService, $timeout, AdminUserApi) {
    var vm = this;
    vm.form = {};
    vm.busy = false;

    onCreate();

    function onCreate() {
      vm.user = userResolve;
      if (!vm.user._id) {
        userResolve.private = { sex: 1 };
        userResolve.roles = ['user'];
        userResolve.leaders = [];
      }
      prepareDepartments();
      vm.isShowLeaderDropdown = false;
      vm.leaderSearchKey = '';
      vm.leaderSearching = false;
    }

    function prepareDepartments() {
      DepartmentsService.query(data => {
        vm.departments = data;
      });
    }

    // Lưu thông tin user
    vm.handleSaveUser = isValid => {
      if (vm.busy) return;
      vm.busy = true;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.userForm');
        vm.busy = false;
        return false;
      }
      if (vm.user._id) {
        vm.user.$update(handleSuccess, handleError);
      } else {
        vm.user.$save(handleSuccess, handleError);
      }
      function handleSuccess(res) {
        $state.go('users.view', { userId: vm.user._id });
        vm.busy = false;
      }
      function handleError(err) {
        $scope.handleShowToast(err.data.message, true);
        vm.busy = false;
      }
    };

    // Hủy nhập liệu
    vm.handleCancelInput = () => {
      $scope.handleShowConfirm({
        message: '操作を止めますか？'
      }, () => {
        $state.go($state.previous.state.name || 'users.list', $state.previous.params);
      });
    };

    // Xóa user level logic
    vm.handleRemoveUser = () => {
    };

    // Verify user is manager or user
    vm.isUserRole = () => {
      if (_.contains(vm.user.roles, 'manager') || _.contains(vm.user.roles, 'admin')) {
        return false;
      }
      return true;
    }

    // Thay đổi department
    vm.handleChangeDepartment = () => {
      if (!vm.isUserRole()) return;
      var dpt = _.findWhere(vm.departments, { _id: vm.user.department });
      vm.user.leaders = _.union(vm.user.leaders, dpt.leaders);
    };

    vm.handleLeaderInputChanged = () => {
      if (vm.leaderSearchKey === '') return;
      if (vm.leaderSearchTimer) {
        $timeout.cancel(vm.leaderSearchTimer);
        vm.leaderSearchTimer = undefined;
      }
      vm.leaderSearchTimer = $timeout(handleStartSearchLeaders, 500);
    };
    vm.handleLeaderSelected = (leader) => {
      var item = _.findWhere(vm.users.leaders, { _id: leader._id });
      if (!item) {
        vm.users.leaders.push(leader);
      }
      vm.searchLeaders = _.without(vm.searchLeaders, leader);
      vm.isShowLeaderDropdown = true;
      if (!$scope.$$phase) $scope.$digest();
    };
    vm.handleLeaderRemoved = (leader) => {
      vm.users.leaders = _.without(vm.users.leaders, leader);
    };
    function handleStartSearchLeaders() {
      if (vm.leaderSearching) return;
      vm.leaderSearching = true;
      vm.isShowLeaderDropdown = true;
      var leaders = _.pluck(vm.user.leaders, '_id').join();
      AdminUserApi.searchUsers(vm.leaderSearchKey, leaders, ['manager'])
        .success(users => {
          vm.searchLeaders = users;
          vm.leaderSearching = false;
          if (!$scope.$$phase) $scope.$digest();
        })
        .error(err => {
          $scope.handleShowToast(err.data.message, true);
          vm.isShowLeaderDropdown = false;
          vm.leaderSearching = false;
        });
    }

    // $scope.remove = function (user) {
    //   if (confirm('Are you sure you want to delete this user?')) {
    //     if (user) {
    //       user.$remove();

    //       $scope.users.splice($scope.users.indexOf(user), 1);
    //     } else {
    //       $scope.user.$remove(function () {
    //         $state.go('admin.users');
    //       });
    //     }
    //   }
    // };

    // $scope.update = function (isValid) {
    //   if (!isValid) {
    //     $scope.$broadcast('show-errors-check-validity', 'vm.form.userForm');

    //     return false;
    //   }

    //   var user = $scope.user;

    //   user.$update(function () {
    //     $state.go('admin.user', {
    //       userId: user._id
    //     });
    //   }, function (errorResponse) {
    //     $scope.error = errorResponse.data.message;
    //   });
    // };
  }
]);
