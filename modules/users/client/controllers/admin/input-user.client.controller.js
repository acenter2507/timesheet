'use strict';

angular.module('users.admin').controller('UserInputController', ['$scope', '$state', 'userResolve', 'DepartmentsService', '$timeout', 'AdminUserApi', 'ngDialog',
  function ($scope, $state, userResolve, DepartmentsService, $timeout, AdminUserApi, ngDialog) {
    var vm = this;
    vm.form = {};
    vm.busy = false;

    onCreate();

    function onCreate() {
      vm.user = userResolve;
      console.log(vm.user);
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

      console.log(vm.user.leaders);
      console.log(vm.user.private.birthdate);
      var leaderIds = _.pluck(vm.user.leaders, '_id');
      vm.user.leaders = leaderIds;

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
        handlePreviousScreen();
      });
    };

    // Xóa user level logic
    vm.handleRemoveUser = () => {
      $scope.handleShowConfirm({
        message: vm.user.displayName + 'を削除しますか？'
      }, () => {
        vm.user.status = 3;
        vm.user.$update(() => {
          if (!$scope.isAdmin) {
            handlePreviousScreen();
          }
        })
      });
    };

    // Xóa user level vật lý
    vm.handleAdminRemoveUser = () => {
      $scope.handleShowConfirm({
        message: vm.user.displayName + 'を完全削除しますか？'
      }, () => {
        vm.user.$remove(() => {
          handlePreviousScreen();
        })
      });
    };

    // Thay đổi mật khẩu của user
    vm.handleResetPassword = () => {
      ngDialog.openConfirm({
        templateUrl: 'changePassTemplate.html',
        scope: $scope
      }).then(password => {
        AdminUserApi.changeUserPassword(vm.user._id, password)
          .success(() => {
            $scope.handleShowToast('パスワードが変更しました。', false);
          })
          .error(err => {
            $scope.handleShowToast(err.message, true);
          });
      });
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
      if (!vm.isUserRole() || !vm.user.department) return;
      var dpt = _.findWhere(vm.departments, { _id: vm.user.department });
      $scope.handleShowConfirm({
        message: dpt.name + 'のリーダーをリストに追加しますか？',
        button: '追加'
      }, () => {
        vm.user.leaders = _.union(vm.user.leaders, dpt.leaders);
      });
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
      var item = _.findWhere(vm.user.leaders, { _id: leader._id });
      if (!item) {
        vm.user.leaders.push(leader);
      }
      vm.searchLeaders = _.without(vm.searchLeaders, leader);
      vm.isShowLeaderDropdown = true;
      if (!$scope.$$phase) $scope.$digest();
    };
    vm.handleLeaderRemoved = (leader) => {
      vm.user.leaders = _.without(vm.user.leaders, leader);
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
    function handlePreviousScreen() {
      $state.go($state.previous.state.name || 'users.list', $state.previous.params)
    }
  }
]);
