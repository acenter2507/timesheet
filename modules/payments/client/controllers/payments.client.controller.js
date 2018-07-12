(function () {
  'use strict';

  // Payments controller
  angular
    .module('payments')
    .controller('PaymentsController', PaymentsController);

  PaymentsController.$inject = ['$scope', '$state', '$stateParams', 'PaymentsService', 'PaymentFactory', 'PaymentsApi'];

  function PaymentsController($scope, $state, $stateParams, PaymentsService, PaymentFactory, PaymentsApi) {
    var vm = this;
    vm.isShowHistory = false;

    onCreate();
    function onCreate() {
      preparePayment();
    }

    function preparePayment() {
      if (PaymentFactory.payment) {
        vm.payment = PaymentFactory.payment;
        PaymentFactory.delete();
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
    vm.handleRequestDeletePayment = function () {
      $scope.handleShowConfirm({
        message: '清算表を取り消し申請しますか？'
      }, function () {
        PaymentsApi.requestDelete(vm.payment._id)
          .success(function (payment) {
            _.extend(vm.payment, payment);
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
        var rsPayment = new PaymentsService({ _id: vm.payment._id });
        rsPayment.$remove(function () {
          handlePreviousScreen();
        });
      });
    };
    vm.handlePreviousScreen = handlePreviousScreen;
    function handlePreviousScreen() {
      var state = $state.previous.state.name || 'payments.list';
      var params = state === 'payments.list' ? {} : $state.previous.params;
      $state.go(state, params);
    }
    // TRANSPORT
    vm.handleAddTransport = function () {
      PaymentFactory.set(vm.payment);
      $state.go('payments.transport', { paymentId: vm.payment._id });
    };
    vm.handleEditTransport = function (transport) {
      PaymentFactory.set(vm.payment);
      PaymentFactory.setTransport(transport);
      $state.go('payments.transport', { paymentId: vm.payment._id, transport: transport._id });
    };
    vm.handleRemoveTransport = function (transport) {
      $scope.handleShowConfirm({
        message: '交通費を削除しますか？'
      }, function () {
        vm.payment.transports = _.without(vm.payment.transports, transport);
        // TODO (Lưu ngay khi xóa hay bấm button lưu)
        vm.handleSavePayment();
      });
    };
    // TRIPS
    vm.handleAddTrip = function () {
      PaymentFactory.set(vm.payment);
      $state.go('payments.trip', { paymentId: vm.payment._id });
    };
    vm.handleEditTrip = function (trip) {
      PaymentFactory.set(vm.payment);
      PaymentFactory.setTrip(trip);
      $state.go('payments.trip', { paymentId: vm.payment._id, trip: trip._id });
    };
    vm.handleRemoveTrip = function (trip) {
      $scope.handleShowConfirm({
        message: '出張旅費を削除しますか？'
      }, function () {
        vm.payment.trips = _.without(vm.payment.trips, trip);
        // TODO (Lưu ngay khi xóa hay bấm button lưu)
        vm.handleSavePayment();
      });
    };
    // VEHICLES
    vm.handleAddVehicle = function () {
      PaymentFactory.set(vm.payment);
      $state.go('payments.vehicle', { paymentId: vm.payment._id });
    };
    vm.handleEditVehicle = function (vehicle) {
      PaymentFactory.set(vm.payment);
      PaymentFactory.setVehicle(vehicle);
      $state.go('payments.vehicle', { paymentId: vm.payment._id, vehicle: vehicle._id });
    };
    vm.handleRemoveVehicle = function (vehicle) {
      $scope.handleShowConfirm({
        message: '燃料費を削除しますか？'
      }, function () {
        vm.payment.vehicles = _.without(vm.payment.vehicles, vehicle);
        vm.handleSavePayment();
      });
    };
    // OTHERS
    vm.handleAddOther = function () {
      PaymentFactory.set(vm.payment);
      $state.go('payments.other', { paymentId: vm.payment._id });
    };
    vm.handleEditOther = function (other) {
      PaymentFactory.set(vm.payment);
      PaymentFactory.setOther(other);
      $state.go('payments.other', { paymentId: vm.payment._id, other: other._id });
    };
    vm.handleRemoveOther = function (other) {
      $scope.handleShowConfirm({
        message: 'その他の費用を削除しますか？'
      }, function () {
        vm.payment.others = _.without(vm.payment.others, other);
        vm.handleSavePayment();
      });
    };
    // MEETINGS
    vm.handleAddMeeting = function () {
      PaymentFactory.set(vm.payment);
      $state.go('payments.meeting', { paymentId: vm.payment._id });
    };
    vm.handleEditMeeting = function (meeting) {
      PaymentFactory.set(vm.payment);
      PaymentFactory.setMeeting(meeting);
      $state.go('payments.meeting', { paymentId: vm.payment._id, meeting: meeting._id });
    };
    vm.handleRemoveMeeting = function (meeting) {
      $scope.handleShowConfirm({
        message: '接待交際費を削除しますか？'
      }, function () {
        vm.payment.meetings = _.without(vm.payment.meetings, meeting);
        vm.handleSavePayment();
      });
    };
  }
}());
