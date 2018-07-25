'use strict';

angular
  .module('users.admin')
  .controller('UserListController', UserListController);

UserListController.$inject = [
  '$scope',
  '$state',
  'AdminUserApi',
  'AdminUserService',
  '$stateParams',
  'UserRolesService',
  '$q'
];

function UserListController(
  $scope,
  $state,
  AdminUserApi,
  AdminUserService,
  $stateParams,
  UserRolesService,
  $q
) {
  var vm = this;
  vm.users = [];
  vm.condition = {};

  vm.busy = false;
  vm.page = 1;
  vm.pages = 0;
  vm.total = 0;

  onCreate();
  function onCreate() {
    prepareCondition();
    prepareParams();
    handleSearch();
  }
  function prepareCondition() {
    vm.condition = {
      sort: '-created',
      limit: 10,
      roles: []
    };
    vm.condition.role = ($stateParams.role) ? $stateParams.role : undefined;
  }
  function prepareParams() {
    if ($stateParams.role) {
      vm.condition.roles.push(UserRolesService.getRole($stateParams.role));
      delete vm.condition.role;
    }
  }
  function handleSearch() {
    if (vm.busy) return;
    vm.busy = true;
    AdminUserApi.list(vm.condition, vm.page)
      .success(function (res) {
        vm.users = res.docs;
        vm.pages = res.pages;
        vm.total = res.total;
        vm.busy = false;
      })
      .error(function (err) {
        $scope.handleShowToast(err.message, true);
        vm.busy = false;
      });
  }

  vm.handleStartSearch = function () {
    vm.page = 1;
    handleSearch();
  };
  vm.handlePageChanged = function () {
    handleSearch();
  };
  vm.handleClearCondition = function () {
    prepareCondition();
  };
  vm.handleSearchRoles = function () {
    var deferred = $q.defer();
    deferred.resolve(UserRolesService.roles);
    return deferred.promise;
  };
  vm.hanleSelectUser = function (user) {
    $state.go('admin.users.edit', { userId: user._id });
  };
  vm.handleDeleteUser = function (user) {
    $scope.handleShowConfirm({
      message: user.displayName + 'と関連のデータを削除してますか？'
    }, function () {
      var rsUser = new AdminUserService({ _id: user._id });
      rsUser.$remove(function () {
        vm.users = _.without(vm.users, user);
        vm.total -= 1;
      });
    });
  };

}
