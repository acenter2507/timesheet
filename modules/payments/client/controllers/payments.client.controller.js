(function () {
  'use strict';

  // Payments controller
  angular
    .module('payments')
    .controller('PaymentsController', PaymentsController);

  PaymentsController.$inject = ['$scope', '$state', 'ngDialog', '$stateParams', 'PaymentsService', 'PaymentFactory'];

  function PaymentsController($scope, $state, ngDialog, $stateParams, PaymentsService, PaymentFactory) {
    var vm = this;

    var ui_config = {
      vehicle: {
        is_open_picker: false,
        date_error: false,
        content_error: false,
        purpose_error: false
      },
      other: {
        is_open_picker: false,
        date_error: false,
        content_error: false
      },
      meeting: {
        is_open_picker: false,
        date_error: false,
        content_error: false,
        account_error: false,
        kind_error: false
      }
    };

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

    vm.handleSavePayments = function () {
      // Verify Payments
      $scope.handleShowConfirm({
        message: '清算表を保存しますか？'
      }, function () {
        // PaymentsApi.request(item.payment._id)
        //   .success(function (data) {
        //     _.extend(item.payment, data);
        //   })
        //   .error(function (err) {
        //     $scope.handleShowToast(err.message, true);
        //   });
      });
    };
    vm.handleCalculatePayment = function () {
    };
    vm.handleValidatePayment = function () {
    };

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
        vm.handleCalculatePayment();
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
        vm.handleCalculatePayment();
      });
    };
    // VEHICLES
    vm.handleAddVehicle = function () {
      PaymentFactory.set(vm.payment);
      $state.go('payments.vehicle', { paymentId: vm.payment._id });

      // var vehicle = {
      //   id: new Date().getTime(),
      //   method: 1,
      //   fee: 0,
      //   receipts: []
      // };
      // _.extend(vehicle, ui_config.vehicle);
      // $scope.vehicle = vehicle;
      // var mDialog = ngDialog.open({
      //   template: 'modules/payments/client/views/templates/payment-vehicle.client.template.html',
      //   controller: 'PaymentVehicleController',
      //   appendClassName: 'ngdialog-custom',
      //   scope: $scope,
      //   showClose: false,
      //   closeByDocument: false
      // });
      // mDialog.closePromise.then(function (res) {
      //   if (!res.value || res.value === '$document') {
      //     delete $scope.vehicle;
      //     return;
      //   }
      //   vm.payment.vehicles.push(res.value);
      //   vm.handleCalculatePayment();
      //   delete $scope.vehicle;
      // });
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
        vm.handleCalculatePayment();
      });
    };
    // OTHERS
    vm.handleAddOther = function () {
      var other = {
        id: new Date().getTime(),
        fee: 0,
        receipts: []
      };
      _.extend(other, ui_config.other);
      $scope.other = other;
      var mDialog = ngDialog.open({
        template: 'modules/payments/client/views/templates/payment-other.client.template.html',
        controller: 'PaymentOtherController',
        appendClassName: 'ngdialog-custom',
        scope: $scope,
        showClose: false,
        closeByDocument: false
      });
      mDialog.closePromise.then(function (res) {
        if (!res.value || res.value === '$document') {
          delete $scope.other;
          return;
        }
        vm.payment.others.push(res.other);
        vm.handleCalculatePayment();
        delete $scope.other;
      });
    };
    vm.handleRemoveOther = function (other) {
      $scope.handleShowConfirm({
        message: 'その他の費用を削除しますか？'
      }, function () {
        vm.payment.others = _.without(vm.payment.others, other);
        vm.handleCalculatePayment();
      });
    };
    // MEETINGS
    vm.handleAddMeeting = function () {
      var meeting = {
        id: new Date().getTime(),
        account: 1,
        kind: 1,
        fee: 0,
        partners: [''],
        employees: [''],
        receipts: []
      };
      _.extend(meeting, ui_config.meeting);
      $scope.meeting = meeting;
      var mDialog = ngDialog.open({
        template: 'modules/payments/client/views/templates/payment-meeting.client.template.html',
        controller: 'PaymentMeetingController',
        appendClassName: 'ngdialog-custom',
        scope: $scope,
        showClose: false,
        closeByDocument: false
      });
      mDialog.closePromise.then(function (res) {
        if (!res.value || res.value === '$document') {
          delete $scope.meeting;
          return;
        }
        vm.payment.meetings.push(res.meeting);
        vm.handleCalculatePayment();
        delete $scope.meeting;
      });
    };
    vm.handleRemoveMeeting = function (meeting) {
      $scope.handleShowConfirm({
        message: '接待交際費を削除しますか？'
      }, function () {
        vm.payment.meetings = _.without(vm.payment.meetings, meeting);
        vm.handleCalculatePayment();
      });
    };









    // Remove existing Payment
    // function remove() {
    //   if ($window.confirm('Are you sure you want to delete?')) {
    //     vm.payment.$remove($state.go('payments.list'));
    //   }
    // }

    // // Save Payment
    // function save(isValid) {
    //   if (!isValid) {
    //     $scope.$broadcast('show-errors-check-validity', 'vm.form.paymentForm');
    //     return false;
    //   }

    //   // TODO: move create/update logic to service
    //   if (vm.payment._id) {
    //     vm.payment.$update(successCallback, errorCallback);
    //   } else {
    //     vm.payment.$save(successCallback, errorCallback);
    //   }

    //   function successCallback(res) {
    //     $state.go('payments.view', {
    //       paymentId: res._id
    //     });
    //   }

    //   function errorCallback(res) {
    //     vm.error = res.data.message;
    //   }
    // }
  }
}());
