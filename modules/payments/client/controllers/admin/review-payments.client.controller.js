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
    AdminUserService,
    AdminUserApi,
    $q
  ) {
    var vm = this;
    vm.payments = [];
    vm.condition = {};

    vm.busy = false;
    vm.page = 1;
    vm.pages = 0;
    vm.total = 0;
    vm.historys = [];

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
        users: []
      };
      vm.condition.status = ($stateParams.status) ? $stateParams.status : undefined;
      vm.condition.user = ($stateParams.user) ? $stateParams.user : undefined;
    }
    function prepareParams() {
      if ($stateParams.user) {
        AdminUserService.get({ userId: $stateParams.user }).$promise.then(function (user) {
          var _user = _.pick(user, 'displayName', 'email', 'profileImageURL', '_id');
          vm.condition.users.push(_user);
          delete vm.condition.user;
        });
      }
    }
    function handleSearch() {
      if (vm.busy) return;
      vm.busy = true;
      PaymentsAdminApi.reviews(vm.condition, vm.page)
        .success(function (res) {
          vm.payments = res.docs;
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
    vm.handleViewHistory = function (payment) {
      vm.isShowHistory = true;
      vm.historys = payment.historys;
    };
    vm.handleCloseHistory = function () {
      vm.isShowHistory = false;
      vm.historys = [];
    };
    vm.handleApprovePayment = function (payment) {
      $scope.handleShowConfirm({
        message: 'この清算表を承認しますか？'
      }, function () {
        PaymentsAdminApi.approve(payment._id)
          .success(function (_payment) {
            _.extend(payment, _payment);
          })
          .error(function (err) {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    vm.handleRejectPayment = function (payment) {
      $scope.handleShowConfirm({
        message: 'この清算表を拒否しますか？'
      }, function () {
        PaymentsAdminApi.reject(payment._id)
          .success(function (_payment) {
            _.extend(payment, _payment);
          })
          .error(function (err) {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    vm.handleDeletePayment = function (payment) {
      $scope.handleShowConfirm({
        message: '清算表を削除しますか？'
      }, function () {
        var rsPayment = new PaymentsService({ _id: payment._id });
        rsPayment.$remove(function () {
          vm.payments = _.without(vm.payments, payment);
          vm.total -= 1;
        });
      });
    };
    vm.hanleSelectPayment = function (payment) {
      $state.go('admin.payments.review', { paymentId: payment._id });
    };
  }
}());
