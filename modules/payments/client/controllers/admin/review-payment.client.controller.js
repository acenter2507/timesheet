(function () {
  'use strict';

  // Payments controller
  angular
    .module('payments.admin')
    .controller('PaymentReviewController', PaymentReviewController);

  PaymentReviewController.$inject = ['$scope', '$state', '$stateParams', 'PaymentsService', 'PaymentFactory', 'PaymentsApi'];

  function PaymentReviewController($scope, $state, $stateParams, PaymentsService, PaymentFactory, PaymentsApi) {
    var vm = this;
    vm.isShowHistory = false;

    onCreate();
    function onCreate() {
      preparePayment();
    }

    function preparePayment() {
      if (PaymentFactory.payment) {
        vm.payment = PaymentFactory.payment;
      } else {
        PaymentsService.get({
          paymentId: $stateParams.paymentId
        }).$promise.then(function (payment) {
          vm.payment = payment;
        });
      }
    }

    vm.handleSavePayment = function () {
      vm.payment.$update(function (payment) {
        _.extend(vm.payment, payment);
      }, function (err) {
        $scope.handleShowToast(err.message, true);
      });
    };
    vm.handleRequestPayment = function () {
      $scope.handleShowConfirm({
        message: '清算表を申請しますか？'
      }, function () {
        PaymentsApi.request(vm.payment._id)
          .success(function (data) {
            _.extend(vm.payment, data);
          })
          .error(function (err) {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    vm.handleCancelPayment = function () {
      $scope.handleShowConfirm({
        message: '清算表の申請をキャンセルしますか？'
      }, function () {
        PaymentsApi.cancel(vm.payment._id)
          .success(function (data) {
            _.extend(vm.payment, data);
          })
          .error(function (err) {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    vm.handlePreviousScreen = handlePreviousScreen;
    function handlePreviousScreen() {
      var state = $state.previous.state.name || 'admin.payments.reviews';
      var params = state === 'admin.payments.reviews' ? {} : $state.previous.params;
      $state.go(state, params);
    }
  }
}());
