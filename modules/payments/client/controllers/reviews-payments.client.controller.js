(function () {
  'use strict';

  // Payments controller
  angular
    .module('payments')
    .controller('PaymentsReviewsController', PaymentsReviewsController);

  PaymentsReviewsController.$inject = ['$scope', 'PaymentsService', '$state', 'CommonService', '$stateParams', 'PaymentsApi', '$timeout', 'DepartmentsService'];

  function PaymentsReviewsController($scope, PaymentsService, $state, CommonService, $stateParams, PaymentsApi, $timeout, DepartmentsService) {
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
      prepareParams();
      prepareDepartments();
      prepareCondition();
      handleSearch();
    }
    function prepareParams() {

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
      vm.condition.user = ($stateParams.user) ? $stateParams.user : undefined;
    }
    function handleSearch() {
      if (vm.busy) return;
      vm.busy = true;
      PaymentsApi.reviews(vm.condition, vm.page)
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
