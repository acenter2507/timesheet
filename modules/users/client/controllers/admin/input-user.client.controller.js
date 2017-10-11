'use strict';

angular.module('users.admin').controller('UserInputController', ['$scope', '$state', 'userResolve', 'DepartmentsService', '$timeout', 'AdminUserApi', 'ngDialog',
  function ($scope, $state, userResolve, DepartmentsService, $timeout, AdminUserApi, ngDialog) {
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
      } else {
        if (vm.user.private.birthdate) {
          var birth = moment(vm.user.private.birthdate).local().format('YYYY/MM/DD');
          vm.user.private.birthdate = birth;
        }
      }
      prepareDepartments();
    }
    function prepareDepartments() {
      DepartmentsService.query(data => {
        vm.departments = data;
        if (vm.user.department) {
          vm.currentDepartment = _.findWhere(vm.departments, { _id: vm.user.department });
        }
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

      // Chuyển danh sách leader về dạng string array
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
        });
      });
    };
    // Xóa user level vật lý
    vm.handleAdminRemoveUser = () => {
      $scope.handleShowConfirm({
        message: vm.user.displayName + 'を完全削除しますか？'
      }, () => {
        vm.user.$remove(() => {
          handlePreviousScreen();
        });
      });
    };
    // Thay đổi mật khẩu của user
    vm.handleResetPassword = () => {
      if (vm.roles_busy) return;
      vm.password_busy = true;
      ngDialog.openConfirm({
        templateUrl: 'changePassTemplate.html',
        scope: $scope
      }).then(password => {
        AdminUserApi.changeUserPassword(vm.user._id, password)
          .success(() => {
            $scope.handleShowToast('パスワードが変更しました。', false);
            vm.password_busy = false;
          })
          .error(err => {
            $scope.handleShowToast(err.message, true);
            vm.password_busy = false;
          });
      }, () => {
        vm.password_busy = false;
      });
    };
    // Thay đổi role của user
    vm.handleChangeRoles = () => {
      if (vm.roles_busy) return;
      vm.roles_busy = true;
      $scope.roles = vm.user.roles;
      ngDialog.openConfirm({
        templateUrl: 'selectRolesTemplate.html',
        scope: $scope
      }).then(roles => {
        delete $scope.roles;
        if (angular.equals(roles, vm.user.roles)) return;
        AdminUserApi.changeUserRoles(vm.user._id, roles)
          .success(res => {
            vm.user.roles = roles;
            vm.user.leaders = res;
            vm.roles_busy = false;
            $scope.handleShowToast('役割が変更しました。', false);
          })
          .error(err => {
            vm.roles_busy = false;
            $scope.handleShowToast(err.message, true);
          });
      }, () => {
        vm.roles_busy = false;
        delete $scope.roles;
      });
    };
    vm.handleChangeDeparment = () => {
      if (vm.department_busy) return;
      vm.department_busy = true;
      $scope.dialog = {
        departments: vm.departments,
        department: vm.user.department
      };
      ngDialog.openConfirm({
        templateUrl: 'selectDepartmentTemplate.html',
        scope: $scope
      }).then(department => {
        delete $scope.dialog;
        if (vm.user.department && department && department.toString() === vm.user.department.toString()) return;
        if (!department && !vm.user.department) return;
        AdminUserApi.changeUserDepartment(vm.user._id, department)
          .success(res => {
            vm.user.department = department;
            vm.currentDepartment = _.findWhere(vm.departments, { _id: department });
            if (!_.contains(vm.user.roles, 'manager')) {
              vm.user.leaders = res;
            }
            $scope.handleShowToast('役割が変更しました。', false);
            vm.department_busy = false;
          })
          .error(err => {
            vm.department_busy = false;
            $scope.handleShowToast(err.message, true);
          });
      }, () => {
        vm.department_busy = false;
        delete $scope.dialog;
      });
    };
    // Verify user is manager or user
    vm.isUserRole = () => {
      if (_.contains(vm.user.roles, 'manager') || _.contains(vm.user.roles, 'admin')) {
        return false;
      }
      return true;
    };
    // Thay đổi department
    vm.handleChangeDepartment = () => {
      if (!vm.isUserRole() || !vm.user.department) return;
      var dpt = _.findWhere(vm.departments, { _id: vm.user.department });
      vm.user.leaders = dpt.leaders;
    };
    // Trở về màn hình trước
    function handlePreviousScreen() {
      $state.go($state.previous.state.name || 'users.list', $state.previous.params);
    }
  }
]);
