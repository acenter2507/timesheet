'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'userResolve', 'AdminUserService', 'AdminUserApi', 'DepartmentsService', 'ngDialog',
  function ($scope, $state, userResolve, AdminUserService, AdminUserApi, DepartmentsService, ngDialog) {
    var vm = this;
    vm.user = userResolve;

    onCreate();

    function onCreate() {
      prepareSecurityCheck();
      prepareDepartments();
    }

    function prepareDepartments() {
      DepartmentsService.query(data => {
        vm.departments = data;
      });
    }
    function prepareSecurityCheck() {
      if (!$scope.isAdmin && !$scope.isAccountant) {
        handlePreviousScreen();
        return $scope.handleShowToast('このページを表示する権限がありません。', true);
      }
      if (vm.user.status === 3 && !$scope.isAdmin) {
        handlePreviousScreen();
        return $scope.handleShowToast('このユーザーが削除されました。', true);
      }
    }
    // Trở về màn hình trước
    function handlePreviousScreen() {
      $state.go($state.previous.state.name || 'home', $state.previous.params);
    }

    vm.handleSendMessage = () => {
      $scope.handleShowToast('只今、この機能は作成中です。');
    };
    // Đổi trạng thái user sang nghỉ việc
    vm.handleRetired = () => {
      $scope.handleShowConfirm({
        message: vm.user.displayName + 'を退職させますか？'
      }, () => {
        var rsUser = new AdminUserService({ _id: vm.user._id });
        rsUser.status = 2;
        vm.user.status = 2;
        rsUser.$update();
      });
    };
    // Đổi trạng thái user sang nghỉ việc
    vm.handleReWorking = () => {
      $scope.handleShowConfirm({
        message: vm.user.displayName + 'を在職させますか？'
      }, () => {
        var rsUser = new AdminUserService({ _id: vm.user._id });
        rsUser.status = 1;
        vm.user.status = 1;
        rsUser.$update();
      });
    };
    // Thay đổi mật khẩu của user
    vm.handleChangePassword = () => {
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
    // Thay đổi role của user
    vm.handleChangeRoles = () => {
      $scope.roles = getMainRole(vm.user.roles);
      ngDialog.openConfirm({
        templateUrl: 'selectRolesTemplate.html',
        scope: $scope
      }).then(result => {
        delete $scope.roles;
        var roles = (result !== 'user') ? ['user', result] : [result];
        if (angular.equals(roles, vm.user.roles)) return;
        AdminUserApi.changeUserRoles(vm.user._id, roles)
          .success(res => {
            vm.user.roles = roles;
            $scope.handleShowToast('役割が変更しました。', false);
          })
          .error(err => {
            $scope.handleShowToast(err.message, true);
          });
      }, () => {
        delete $scope.roles;
      });
    };
    // Thay đổi bộ phận của user
    vm.handleChangeDepartment = () => {
      var currentDepartment = (vm.user.department) ? vm.user.department._id || vm.user.department : undefined;
      $scope.dialog = {
        departments: vm.departments,
        department: currentDepartment
      };
      ngDialog.openConfirm({
        templateUrl: 'selectDepartmentTemplate.html',
        scope: $scope
      }).then(newDepartment => {
        delete $scope.dialog;
        if (currentDepartment && newDepartment && newDepartment.toString() === currentDepartment.toString()) return;
        if (!newDepartment && !currentDepartment) return;
        AdminUserApi.changeUserDepartment(vm.user._id, newDepartment)
          .success(res => {
            vm.user.department = _.findWhere(vm.departments, { _id: newDepartment });
            $scope.handleShowToast('役割が変更しました。', false);
          })
          .error(err => {
            $scope.handleShowToast(err.message, true);
          });
      }, () => {
        delete $scope.dialog;
      });
    };
    // Logic delete
    vm.handleLogicDeleteUser = user => {
      $scope.handleShowConfirm({
        message: vm.user.displayName + 'を削除しますか？'
      }, () => {
        var rsUser = new AdminUserService({ _id: vm.user._id });
        rsUser.status = 3;
        rsUser.$update();
        if (vm.user.department) {
          DepartmentsApi.removeUser(vm.user.department._id, vm.user._id);
        }
        handlePreviousScreen();
      });
    };
    // Restore account
    vm.handleResetUser = () => {
      $scope.handleShowConfirm({
        message: vm.user.displayName + 'を復元しますか？'
      }, () => {
        var rsUser = new AdminUserService({ _id: vm.user._id });
        rsUser.status = 1;
        vm.user.status = 1;
        rsUser.$update();
      });
    };
    // Remove database
    vm.handleDatabaseDeleteUser = user => {
      $scope.handleShowConfirm({
        message: vm.user.displayName + 'を完全削除しますか？'
      }, () => {
        var rsUser = new AdminUserService({ _id: vm.user._id });
        rsUser.$remove();
        handlePreviousScreen();
      });
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
