(function () {
  'use strict';

  // Payments controller
  angular
    .module('payments.admin')
    .controller('PaymentReviewController', PaymentReviewController);

  PaymentReviewController.$inject = ['$scope', '$state', 'paymentResolve', '$stateParams', 'PaymentsService', 'PaymentsAdminApi'];

  function PaymentReviewController($scope, $state, payment, $stateParams, PaymentsService, PaymentsAdminApi) {
    var vm = this;
    vm.payment = payment;
    vm.isShowHistory = false;

    onCreate();
    function onCreate() {
    }

    vm.handleApprovePayment = function () {
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
    vm.handleRejectPayment = function () {
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
    vm.handleDeletePayment = function () {
      $scope.handleShowConfirm({
        message: '清算表を削除しますか？'
      }, function () {
        var rsPayment = new PaymentsService({ _id: payment._id });
        rsPayment.$remove(function () {
          handlePreviousScreen();
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
