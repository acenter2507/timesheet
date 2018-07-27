'use strict';

angular.module('users.admin')
  .controller('UserController', UserController);

UserController.$inject = [
  '$scope',
  'userResolve',
  'UserRolesService',
  'ngDialog',
  'AdminUserApi',
  '$q'
];

function UserController(
  $scope,
  userResolve,
  UserRolesService,
  ngDialog,
  AdminUserApi,
  $q
) {
  var vm = this;
  vm.user = userResolve;
  vm.busy = false;
  vm.form = {};

  onCreate();

  function onCreate() {
    prepareUser();
  }

  function prepareUser() {
    if (!vm.user._id) {
      var user_role = UserRolesService.getRole('user');
      vm.user._roles = [user_role];
    } else {
      vm.user._roles = [];
      for (var i = 0; i < vm.user.roles.length; i++) {
        var role = vm.user.roles[i];
        vm.user._roles.push(UserRolesService.getRole(role));
      }
    }
  }
  vm.handleSearchRoles = function () {
    var deferred = $q.defer();
    deferred.resolve(UserRolesService.roles);
    return deferred.promise;
  };
  vm.handleSaveUser = function (isValid) {
    if (!isValid) {
      $scope.$broadcast('show-errors-check-validity', 'vm.form.userForm');
      alert(1);
      return false;
    }
    if (vm.user._roles.length === 0) {
      $scope.handleShowToast('役割を追加してください！', true);
      return false;
    }
    if (vm.busy) return;
    vm.busy = true;

    vm.user.roles = _.pluck(vm.user._roles, 'value');
    if (vm.user._id) {
      vm.user.$update(successCallback, errorCallback);
    } else {
      vm.user.$save(successCallback, errorCallback);
    }

    function successCallback(res) {
      vm.busy = false;
      $scope.handleBackScreen('admin.users.list');
    }

    function errorCallback(err) {
      vm.busy = false;
      $scope.handleShowToast(err.data.message, true);
    }

  };
  vm.handleResetPassword = function () {
    ngDialog.openConfirm({
      templateUrl: 'changePassTemplate.html',
      scope: $scope,
      showClose: false
    }).then(function (password) {
      AdminUserApi.resetpass(vm.user._id, password)
        .success(function () {
          $scope.handleShowToast('パスワードをリセットしました！', false);
        })
        .error(function (err) {
          $scope.handleShowToast(err.message, true);
        });
    });
  };
}