(function () {
  'use strict';

  // Payments controller
  angular
    .module('payments.admin')
    .controller('PaymentsReviewController', PaymentsReviewController);

  PaymentsReviewController.$inject = ['$scope', 'PaymentsService', '$state', 'CommonService', '$stateParams', 'PaymentsAdminApi', 'DepartmentsService'];

  function PaymentsReviewController($scope, PaymentsService, $state, CommonService, $stateParams, PaymentsAdminApi, DepartmentsService) {
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
    function prepareParams() {

      vm.condition.user = ($stateParams.user) ? $stateParams.user : undefined;
    }
    function prepareDepartments() {
      DepartmentsService.query().$promise.then(function (data) {
        vm.departments = data;
      });
    }
    function prepareCondition() {
      vm.condition = {
        sort: '-created',
        limit: 20
      };
      vm.condition.status = ($stateParams.status) ? $stateParams.status : undefined;
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

  }
}());
