(function () {
  'use strict';

  // Payments controller
  angular
    .module('payments.admin')
    .controller('PaymentsReviewController', PaymentsReviewController);

  PaymentsReviewController.$inject = [
    '$scope',
    'PaymentsService',
    '$state',
    'CommonService',
    '$stateParams',
    'PaymentsAdminApi',
    'DepartmentsService',
    'AdminUserService',
    'AdminUserApi',
    '$q'
  ];

  function PaymentsReviewController(
    $scope,
    PaymentsService,
    $state,
    CommonService,
    $stateParams,
    PaymentsAdminApi,
    DepartmentsService,
    AdminUserService,
    AdminUserApi,
    $q
  ) {
    var vm = this;
    vm.payments = [];
    vm.departments = [];
    vm.condition = {};

    vm.busy = false;
    vm.page = 1;
    vm.pages = [];
    vm.total = 0;
    vm.historys = [];

    onCreate();
    function onCreate() {
      prepareCondition();
      prepareParams();
      prepareDepartments();
      handleSearch();
    }
    function prepareCondition() {
      vm.condition = {
        sort: '-created',
        limit: 20,
        users: []
      };
      vm.condition.status = ($stateParams.status) ? $stateParams.status : undefined;
    }
    function prepareParams() {
      if ($stateParams.user) {
        AdminUserService.get({ userId: $stateParams.user }).$promise.then(function (user) {
          var _user = _.pick(user, 'displayName', 'email', 'profileImageURL');
          vm.condition.users.push(_user);
        });
      }
    }
    function prepareDepartments() {
      DepartmentsService.query().$promise.then(function (data) {
        vm.departments = data;
      });
    }
    function handleSearch() {
      if (vm.busy) return;
      vm.busy = true;
      PaymentsAdminApi.reviews(vm.condition, vm.page)
        .success(function (res) {
          vm.payments = res.docs;
          vm.pages = CommonService.createArrayFromRange(res.pages);
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
    vm.handlePageChanged = function (page) {
      vm.page = page;
      handleSearch();
    };
    vm.handleClearCondition = function () {
      prepareCondition();
    };
    vm.handleSearchUsers = function ($query) {
      if (CommonService.isStringEmpty($query)) {
        return [];
      }

      var deferred = $q.defer();
      AdminUserApi.searchUsers({ key: $query, department: false })
        .success(function (users) {
          deferred.resolve(users);
        });

      return deferred.promise;
    };
  }
}());
