(function () {
  'use strict';

  angular
    .module('workmonths')
    .controller('WorkmonthsReviewsController', WorkmonthsReviewsController);

  WorkmonthsReviewsController.$inject = ['WorkmonthsService', '$scope', '$state', 'DateUtil', '$stateParams', 'CommonService', 'WorkmonthsApi', '$timeout'];

  function WorkmonthsListController(WorkmonthsService, $scope, $state, DateUtil, $stateParams, CommonService, WorkmonthsApi, $timeout) {
    var vm = this;

    vm.workmonths = [];
    vm.departments = [];
    vm.condition = {};

    onCreate();
    function onCreate() {
      prepareParams();
      prepareCondition();
    }
    // Khởi tạo điều kiện search
    function prepareCondition() {
      vm.condition = {

      };
    }
    function prepareDepartments() {

    }

    /**
     * HANDLES
     */
    vm.isUserSearching = false;
    vm.isShowUserDropdown = false;
    vm.userSearchKey = '';

    vm.handleUserSearchChanged = () => {
      if (vm.userSearchKey === '') return;
      if (vm.searchTimer) {
        $timeout.cancel(vm.searchTimer);
        vm.searchTimer = undefined;
      }
      vm.searchTimer = $timeout(handleSearchUser, 500);
    };
    function handleSearchUser() {
      if (vm.isUserSearching) return;
      vm.isUserSearching = true;
      AdminUserApi.searchUsers({ key: vm.userSearchKey, department: false })
        .success(users => {
          vm.users = users;
          vm.isSearching = false;
          if (!$scope.$$phase) $scope.$digest();
        })
        .error(err => {
          $scope.handleShowToast(err.message, true);
          vm.isUserSearching = false;
        });
    }
    vm.handleLeaderSelected = user => {
      console.log(user);
    };
  }
}());
