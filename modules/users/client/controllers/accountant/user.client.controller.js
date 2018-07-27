'use strict';

angular.module('users.admin')
  .controller('AccountantUserController', AccountantUserController);

AccountantUserController.$inject = [
  '$scope',
  'userResolve',
  'CommonService',
  '$q'
];

function AccountantUserController(
  $scope,
  userResolve,
  CommonService,
  $q
) {
  var vm = this;
  vm.user = userResolve;
  vm.busy = false;

  onCreate();

  function onCreate() {
    prepareDepartments();
  }

  function prepareDepartments() {
    DepartmentsService.query(function (data) {
      vm.departments = data;
    });
  }
  vm.handleSaveUser = function (isValid) {
    if (!isValid) {
      $scope.$broadcast('show-errors-check-validity', 'vm.form.userForm');
      return false;
    }
    if (vm.busy) return;
    vm.busy = true;

    if (vm.user.department === 'empty') {
      delete vm.user.department;
    }

    vm.user.$update(successCallback, errorCallback);

    function successCallback(res) {
      vm.busy = false;
      _.extend(vm.user, res);
      $scope.handleShowToast('社員の情報を保存しました！', false);
    }

    function errorCallback(err) {
      vm.busy = false;
      $scope.handleShowToast(err.data.message, true);
    }

  };
  vm.handleSearchDepartments = function ($query) {
    if (CommonService.isStringEmpty($query)) {
      return [];
    }

    var deferred = $q.defer();
    CommonService.autocompleteDepartments({ key: $query })
      .success(function (departments) {
        deferred.resolve(departments);
      });

    return deferred.promise;
  };








  // function prepareDepartments() {
  //   DepartmentsService.query(function (data) {
  //     vm.departments = data;
  //   });
  // }
  // function prepareSecurityCheck() {
  //   if (!$scope.isAdmin && !$scope.isAccountant) {
  //     $scope.handleBackScreen('home');
  //     return $scope.handleShowToast('このページを表示する権限がありません。', true);
  //   }
  //   if (vm.user.status === 3 && !$scope.isAdmin) {
  //     $scope.handleBackScreen('home');
  //     return $scope.handleShowToast('このユーザーが削除されました。', true);
  //   }
  // }

  // vm.handleSendMessage = function () {
  //   $scope.handleShowToast('只今、この機能は作成中です。');
  // };
  // // Đổi trạng thái user sang nghỉ việc
  // vm.handleRetired = function () {
  //   $scope.handleShowConfirm({
  //     message: vm.user.displayName + 'を退職させますか？'
  //   }, function () {
  //     var rsUser = new AdminUserService({ _id: vm.user._id });
  //     rsUser.status = 2;
  //     vm.user.status = 2;
  //     rsUser.$update();
  //   });
  // };
  // // Đổi trạng thái user sang nghỉ việc
  // vm.handleReWorking = function () {
  //   $scope.handleShowConfirm({
  //     message: vm.user.displayName + 'を在職させますか？'
  //   }, function () {
  //     var rsUser = new AdminUserService({ _id: vm.user._id });
  //     rsUser.status = 1;
  //     vm.user.status = 1;
  //     rsUser.$update();
  //   });
  // };
  // // Thay đổi mật khẩu của user
  // vm.handleChangePassword = function () {
  //   ngDialog.openConfirm({
  //     templateUrl: 'changePassTemplate.html',
  //     scope: $scope,
  //     showClose: false
  //   }).then(function (password) {
  //     AdminUserApi.changeUserPassword(vm.user._id, password)
  //       .success(function () {
  //         $scope.handleShowToast('パスワードが変更しました。', false);
  //       })
  //       .error(function (err) {
  //         $scope.handleShowToast(err.message, true);
  //       });
  //   });
  // };
  // // Thay đổi role của user
  // vm.handleChangeRoles = function () {
  //   $scope.roles = getMainRole(vm.user.roles);
  //   ngDialog.openConfirm({
  //     templateUrl: 'selectRolesTemplate.html',
  //     scope: $scope,
  //     showClose: false
  //   }).then(function (result) {
  //     delete $scope.roles;
  //     var roles = (result !== 'user') ? ['user', result] : [result];
  //     if (angular.equals(roles, vm.user.roles)) return;
  //     AdminUserApi.changeUserRoles(vm.user._id, roles)
  //       .success(function (res) {
  //         vm.user.roles = roles;
  //         $scope.handleShowToast('役割が変更しました。', false);
  //       })
  //       .error(function (err) {
  //         $scope.handleShowToast(err.message, true);
  //       });
  //   }, function () {
  //     delete $scope.roles;
  //   });
  // };
  // // Thay đổi bộ phận của user
  // vm.handleChangeDepartment = function () {
  //   var currentDepartment = (vm.user.department) ? vm.user.department._id || vm.user.department : undefined;
  //   $scope.dialog = {
  //     departments: vm.departments,
  //     department: currentDepartment
  //   };
  //   ngDialog.openConfirm({
  //     templateUrl: 'selectDepartmentTemplate.html',
  //     scope: $scope,
  //     showClose: false
  //   }).then(function (newDepartment) {
  //     delete $scope.dialog;
  //     if (currentDepartment && newDepartment && newDepartment.toString() === currentDepartment.toString()) return;
  //     if (!newDepartment && !currentDepartment) return;
  //     AdminUserApi.changeUserDepartment(vm.user._id, newDepartment)
  //       .success(function (res) {
  //         vm.user.department = _.findWhere(vm.departments, { _id: newDepartment });
  //         $scope.handleShowToast('役割が変更しました。', false);
  //       })
  //       .error(function (err) {
  //         $scope.handleShowToast(err.message, true);
  //       });
  //   }, function () {
  //     delete $scope.dialog;
  //   });
  // };
  // // Logic delete
  // vm.handleLogicDeleteUser = function (user) {
  //   $scope.handleShowConfirm({
  //     message: vm.user.displayName + 'を削除しますか？'
  //   }, function () {
  //     var rsUser = new AdminUserService({ _id: vm.user._id });
  //     rsUser.status = 3;
  //     rsUser.$update();
  //     if (vm.user.department) {
  //       DepartmentsApi.removeUser(vm.user.department._id, vm.user._id);
  //     }
  //     $scope.handleBackScreen('home');
  //   });
  // };
  // // Restore account
  // vm.handleResetUser = function () {
  //   $scope.handleShowConfirm({
  //     message: vm.user.displayName + 'を復元しますか？'
  //   }, function () {
  //     var rsUser = new AdminUserService({ _id: vm.user._id });
  //     rsUser.status = 1;
  //     vm.user.status = 1;
  //     rsUser.$update();
  //   });
  // };
  // // Remove database
  // vm.handleDatabaseDeleteUser = function (user) {
  //   $scope.handleShowConfirm({
  //     message: vm.user.displayName + 'を完全削除しますか？'
  //   }, function () {
  //     var rsUser = new AdminUserService({ _id: vm.user._id });
  //     rsUser.$remove();
  //     $scope.handleBackScreen('home');
  //   });
  // };

  // // Lấy role chính
  // function getMainRole(roles) {
  //   if (_.contains(roles, 'admin')) return 'admin';
  //   if (_.contains(roles, 'accountant')) return 'accountant';
  //   if (_.contains(roles, 'manager')) return 'manager';
  //   return 'user';
  // }
}