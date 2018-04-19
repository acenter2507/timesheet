(function () {
  'use strict';

  angular
    .module('workmonths')
    .controller('WorkmonthsReviewsController', WorkmonthsReviewsController);

  WorkmonthsReviewsController.$inject = ['WorkmonthsService', '$scope', '$state', 'DateUtil', '$stateParams', 'CommonService', 'WorkmonthsApi', '$timeout', 'AdminUserApi', 'DepartmentsService'];

  function WorkmonthsReviewsController(WorkmonthsService, $scope, $state, DateUtil, $stateParams, CommonService, WorkmonthsApi, $timeout, AdminUserApi, DepartmentsService) {
    var vm = this;

    vm.workmonths = [];
    vm.departments = [];
    vm.condition = {};

    vm.busy = false;
    vm.page = 1;
    vm.pages = [];
    vm.total = 0;

    onCreate();
    function onCreate() {
      prepareParams();
      prepareCondition();
    }
    function prepareParams() {

    }
    // Khởi tạo điều kiện search
    function prepareCondition() {
      vm.condition = {

      };
    }
    function prepareDepartments() {
      DepartmentsService.query().$promise.then(data => {
        vm.departments = data;
      });
    }

    vm.handleClearCondition = () => {
      vm.condition = {};
    };

    vm.handleStartSearch = () => {
      vm.page = 1;
      handleSearch();
    };
    function handleSearch() {
      if (vm.busy) return;
      vm.busy = true;
      WorkmonthsApi.getWorkmonthsReview(vm.condition, vm.page)
        .success(res => {
          vm.workmonths = res.docs;
          vm.pages = CommonService.createArrayFromRange(res.pages);
          vm.total = res.total;
          vm.busy = false;
        })
        .error(err => {
          $scope.handleShowToast(err.message, true);
          vm.busy = false;
        });
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
    vm.handleUserSelected = user => {
      vm.userSearchKey = user.displayName;
      vm.condition.user = user._id;
    };
    function handleSearchUser() {
      if (vm.isUserSearching) return;
      vm.isUserSearching = true;
      vm.isShowUserDropdown = true;
      AdminUserApi.searchUsers({ key: vm.userSearchKey, department: false })
        .success(users => {
          vm.users = users;
          vm.isUserSearching = false;
          if (!$scope.$$phase) $scope.$digest();
        })
        .error(err => {
          $scope.handleShowToast(err.message, true);
          vm.isUserSearching = false;
          vm.isShowUserDropdown = false;
        });
    }
  }
}());
