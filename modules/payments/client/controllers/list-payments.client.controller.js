(function () {
  'use strict';

  angular
    .module('payments')
    .controller('PaymentsListController', PaymentsListController);

  PaymentsListController.$inject = ['$scope', '$state', 'PaymentsService', '$stateParams', 'PaymentsApi'];

  function PaymentsListController($scope, $state, PaymentsService, $stateParams, PaymentsApi) {
    var vm = this;

    vm.payments = [];
    vm.createPaymentBusy = false;
    vm.isShowHistory = false;

    onCreate();

    function onCreate() {
      prepareParams();
      preparePayments();
    }
    function prepareParams() {
      var param = $stateParams.year;
      if (param) {
        vm.currentYear = moment(param, 'YYYY');
      } else {
        vm.currentYear = moment();
      }
    }
    function preparePayments() {
      PaymentsApi.getPaymentsByYear(vm.currentYear.year())
        .success(function (res) {
          prepareShowingPayments(res);
        })
        .error(function (err) {
          $scope.handleShowToast(err.message, true);
        });
    }
    function prepareShowingPayments(datas) {
      for (var index = 1; index <= 12; index++) {
        var payment = _.findWhere(datas, { month: index });
        vm.payments.push({ index: index, payment: payment });
      }
    }
    vm.handleNextYear = function () {
      var lastYear = vm.currentYear.clone().subtract(1, 'years');
      $state.go('payments.list', { year: lastYear.year() });
    };
    vm.handlePreviousYear = function () {
      var nextYear = vm.currentYear.clone().add(1, 'years');
      $state.go('payments.list', { year: nextYear.year() });
    };
    vm.handleCurrentYear = function () {
      var current = moment(new Date(), 'YYYY');
      $state.go('payments.list', { year: current.year() });
    };
    vm.handleCreatePayment = function (index) {
      if (vm.createPaymentBusy) return;
      vm.createPaymentBusy = true;

      var newPayment = new PaymentsService({
        year: vm.currentYear.year(),
        month: index
      });
      newPayment.$save(function (res) {
        vm.createPaymentBusy = false;
        var oldPayment = _.findWhere(vm.payments, { index: index });
        _.extend(oldPayment, { payment: res });
      }, function (err) {
        $scope.handleShowToast(err.data.message, true);
        vm.createPaymentBusy = false;
      });
    };
    vm.handleSendRequestPayment = function (item) {
      $scope.handleShowConfirm({
        message: item.payment.month + '月の清算表を申請しますか？'
      }, function () {
        PaymentsApi.request(item.payment._id)
          .success(function (data) {
            _.extend(item.payment, data);
          })
          .error(function (err) {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    vm.handleDeletePayment = function (item) {
      if (!item.payment) return;
      $scope.handleShowConfirm({
        message: item.payment.month + '月の清算表を削除しますか？'
      }, function () {
        var rsPayment = new PaymentsService({ _id: item.payment._id });
        rsPayment.$remove(function () {
          item.payment = undefined;
        });
      });
    };
    vm.handleViewHistory = function (item) {
      vm.isShowHistory = true;
      vm.historys = item.payment.historys;
    };
    vm.handleCloseHistory = function () {
      vm.isShowHistory = false;
    };
    vm.handleViewDetailUser = function (user) {
      if ($scope.isAdmin || $scope.isAccountant) {
        return $state.go('users.view', { userId: user._id });
      } else {
        return $state.go('profile.view', { userId: user._id });
      }
    };
  }
}());
