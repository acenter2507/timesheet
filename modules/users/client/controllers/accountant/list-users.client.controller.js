'use strict';

angular
  .module('users.admin')
  .controller('AccountantUsersController', AccountantUsersController);

AccountantUsersController.$inject = [
  '$scope',
  '$state',
  'AccountantUserApi',
  'DepartmentsService',
  '$stateParams'
];

function AccountantUsersController(
  $scope,
  $state,
  AccountantUserApi,
  DepartmentsService,
  $stateParams
) {
  var vm = this;
  vm.employees = [];
  vm.departments = [];
  vm.condition = {};

  onCreate();
  function onCreate() {
    prepareDepartments();
    prepareCondition();
    handleSearch();
  }
  function prepareDepartments() {
    DepartmentsService.query(function (data) {
      vm.departments = data;
    });
  }
  function prepareCondition() {
    vm.condition = {
      sort: '-created',
      limit: 10,
      roles: []
    };
    vm.condition.status = ($stateParams.status) ? $stateParams.status : undefined;
    vm.condition.department = ($stateParams.department) ? $stateParams.department : undefined;
  }
  function handleSearch() {
    if (vm.busy) return;
    vm.busy = true;
    AccountantUserApi.list(vm.condition, vm.page)
      .success(function (res) {
        vm.employees = res.docs;
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
  vm.hanleSelectEmployee = function (user) {
    $state.go('accountant.users.edit', { userId: user._id });
  };
}
