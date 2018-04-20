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
    vm.historys = [];

    onCreate();
    function onCreate() {
      prepareParams();
      prepareDepartments();
      prepareCondition();
      handleSearch();
    }
    function prepareParams() {

    }
    // Khởi tạo điều kiện search
    function prepareCondition() {
      vm.condition = {
        sort: '-created',
        limit: 20
      };
      vm.condition.status = ($stateParams.status) ? $stateParams.status : undefined;
      vm.condition.user = ($stateParams.user) ? $stateParams.user : undefined;
    }
    function prepareDepartments() {
      DepartmentsService.query().$promise.then(data => {
        vm.departments = data;
      });
    }

    vm.handleClearCondition = () => {
      prepareCondition();
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
    // View user detail page
    vm.handleViewDetailUser = user => {
      if ($scope.isAdmin || $scope.isAccountant) {
        return $state.go('users.view', { userId: user._id });
      } else {
        return $state.go('profile.view', { userId: user._id });
      }
    };
    vm.handleViewHistory = workmonth => {
      vm.isShowHistory = true;
      vm.historys = workmonth.historys;
    };
    vm.handleCloseHistory = () => {
      vm.isShowHistory = false;
    };
  }
}());
