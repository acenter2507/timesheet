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
      DepartmentsService.query(function (data) {
        vm.departments = data;
        if (vm.user.department) {
          vm.user.department = vm.user.department._id || vm.user.department;
          vm.currentDepartment = _.findWhere(vm.departments, { _id: vm.user.department });
        }
      });
    }
    // Lưu thông tin user
    vm.handleSaveUser = function (isValid) {
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
    vm.handleCancelInput = function () {
      $scope.handleShowConfirm({
        message: '操作を止めますか？'
      }, function () {
        $scope.handleBackScreen('users.list');
      });
    };
    // Xóa user level logic
    vm.handleRemoveUser = function () {
      $scope.handleShowConfirm({
        message: vm.user.displayName + 'を削除しますか？'
      }, function () {
        vm.user.status = 3;
        vm.user.$update(function () {
          if (!$scope.isAdmin) {
            $scope.handleBackScreen('users.list');
          }
        });
      });
    };
    // Xóa user level vật lý
    vm.handleAdminRemoveUser = function () {
      $scope.handleShowConfirm({
        message: vm.user.displayName + 'を完全削除しますか？'
      }, function () {
        vm.user.$remove(function () {
          $scope.handleBackScreen('users.list');
        });
      });
    };
    // Thay đổi mật khẩu của user
    vm.handleResetPassword = function () {
      if (vm.password_busy) return;
      vm.password_busy = true;
      ngDialog.openConfirm({
        templateUrl: 'changePassTemplate.html',
        scope: $scope
      }).then(function (password) {
        AdminUserApi.changeUserPassword(vm.user._id, password)
          .success(function () {
            $scope.handleShowToast('パスワードが変更しました。', false);
            vm.password_busy = false;
          })
          .error(function (err) {
            $scope.handleShowToast(err.message, true);
            vm.password_busy = false;
          });
      }, function () {
        vm.password_busy = false;
      });
    };
    // Thay đổi role của user
    vm.handleChangeRoles = function () {
      if (vm.roles_busy) return;
      vm.roles_busy = true;
      $scope.roles = getMainRole(vm.user.roles);
      ngDialog.openConfirm({
        templateUrl: 'selectRolesTemplate.html',
        scope: $scope
      }).then(function (result) {
        delete $scope.roles;
        var roles = (result !== 'user') ? ['user', result] : [result];
        if (angular.equals(roles, vm.user.roles)) return;
        AdminUserApi.changeUserRoles(vm.user._id, roles)
          .success(function (res) {
            vm.user.roles = roles;
            vm.user.leaders = res;
            vm.roles_busy = false;
            $scope.handleShowToast('役割が変更しました。', false);
          })
          .error(function (err) {
            vm.roles_busy = false;
            $scope.handleShowToast(err.message, true);
          });
      }, function () {
        vm.roles_busy = false;
        delete $scope.roles;
      });
    };
    // Thay đổi bộ phận của user
    vm.handleChangeDepartment = function () {
      if (vm.department_busy) return;
      vm.department_busy = true;
      $scope.dialog = {
        departments: vm.departments,
        department: vm.user.department
      };
      ngDialog.openConfirm({
        templateUrl: 'selectDepartmentTemplate.html',
        scope: $scope
      }).then(function (department) {
        delete $scope.dialog;
        if (vm.user.department && department && department.toString() === vm.user.department.toString()) return;
        if (!department && !vm.user.department) return;
        AdminUserApi.changeUserDepartment(vm.user._id, department)
          .success(function (res) {
            vm.user.department = department;
            vm.currentDepartment = _.findWhere(vm.departments, { _id: department });
            if (!_.contains(vm.user.roles, 'manager')) {
              vm.user.leaders = res;
            }
            $scope.handleShowToast('役割が変更しました。', false);
            vm.department_busy = false;
          })
          .error(function (err) {
            vm.department_busy = false;
            $scope.handleShowToast(err.message, true);
          });
      }, function () {
        vm.department_busy = false;
        delete $scope.dialog;
      });
    };
    // Verify user is manager or user
    vm.isUserRole = function () {
      if (_.contains(vm.user.roles, 'manager') || _.contains(vm.user.roles, 'admin')) {
        return false;
      }
      return true;
    };
    // Thay đổi department
    vm.handleChangedDepartment = function () {
      if (!vm.isUserRole() || !vm.user.department) return;
      var dpt = _.findWhere(vm.departments, { _id: vm.user.department });
      vm.user.leaders = dpt.leaders;
    };
    // Lấy role chính
    function getMainRole(roles) {
      if (_.contains(roles, 'admin')) return 'admin';
      if (_.contains(roles, 'accountant')) return 'accountant';
      if (_.contains(roles, 'manager')) return 'manager';
      return 'user';
    }
  }
]);
