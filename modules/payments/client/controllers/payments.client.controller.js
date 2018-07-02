(function () {
  'use strict';

  // Payments controller
  angular
    .module('payments')
    .controller('PaymentsController', PaymentsController);

  PaymentsController.$inject = ['$scope', '$state', 'paymentResolve', 'ngDialog'];

  function PaymentsController($scope, $state, payment, ngDialog) {
    var vm = this;

    vm.payment = payment;
    vm.form = {};

    var ui_config = {
      transport: {
        is_open_picker: false,
        date_error: false,
        content_error: false,
        start_error: false,
        end_error: false,
        method_error: false,
        fee_error: false
      },
      trip: {
        is_open_picker: false,
        date_error: false,
        content_error: false,
        start_error: false,
        end_error: false,
        method_error: false
      },
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
      console.log(vm.payment);
      prepareTranspot();
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
    function prepareTranspot() {
      if (vm.payment.transports.length === 0) return;
      for (var index = 0; index < vm.payment.transports.length; index++) {
        var transport = vm.payment.transports[index];
        _.extend(transport, ui_config.transport);
      }
    }
    vm.handleAddTransport = function () {
      var transport = {
        id: new Date().getTime(),
        method: 0,
        fee: 0,
        receipts: [],
        taxi_fee: 0
      };
      _.extend(transport, ui_config.transport);
      $scope.transport = transport;
      var mDialog = ngDialog.open({
        template: 'modules/payments/client/views/templates/payment-transport.client.template.html',
        controller: 'PaymentTransportController',
        appendClassName: 'ngdialog-custom',
        scope: $scope,
        showClose: false,
        closeByDocument: false
      });
      mDialog.closePromise.then(function (res) {
        if (!res.value || res.value === '$document') {
          delete $scope.transport;
          return;
        }
        vm.payment.transports.push(res.value);
        vm.handleCalculatePayment();
        delete $scope.transport;
      });
    };
    vm.handleRemoveTransport = function (transport) {
      $scope.handleShowConfirm({
        message: '交通費を削除しますか？'
      }, function () {
        vm.payment.transports = _.without(vm.payment.transports, transport);
        vm.handleCalculatePayment();
      });
    };
    // TRIPS
    function prepareTrips() {
      if (vm.payment.trips.length === 0) return;
      for (var index = 0; index < vm.payment.trips.length; index++) {
        var trip = vm.payment.trips[index];
        _.extend(trip, ui_config.trip);
      }
    }
    vm.handleAddTrip = function () {
      var trip = {
        id: new Date().getTime(),
        method: 0,
        fee: 0,
        receipts: [],
        stay_fee: 0
      };
      _.extend(trip, ui_config.trip);
      $scope.trip = trip;
      var mDialog = ngDialog.open({
        template: 'modules/payments/client/views/templates/payment-trip.client.template.html',
        controller: 'PaymentTripController',
        appendClassName: 'ngdialog-custom',
        scope: $scope,
        showClose: false,
        closeByDocument: false
      });
      mDialog.closePromise.then(function (res) {
        if (!res.value || res.value === '$document') {
          delete $scope.trip;
          return;
        }
        vm.payment.trips.push(res.value);
        vm.handleCalculatePayment();
        delete $scope.trip;
      });
    };
    vm.handleRemoveTrip = function (trip) {
      $scope.handleShowConfirm({
        message: '出張旅費を削除しますか？'
      }, function () {
        vm.payment.trips = _.without(vm.payment.trips, trip);
        vm.handleCalculatePayment();
      });
    };
    // VEHICLES
    function prepareVehicles() {
      if (vm.payment.vehicles.length === 0) return;
      for (var index = 0; index < vm.payment.vehicles.length; index++) {
        var vehicle = vm.payment.vehicles[index];
        _.extend(vehicle, ui_config.vehicle);
      }
    }
    vm.handleAddVehicle = function () {
      var vehicle = {
        id: new Date().getTime(),
        method: 0,
        fee: 0,
        receipts: []
      };
      _.extend(vehicle, ui_config.vehicle);
      $scope.vehicle = vehicle;
      var mDialog = ngDialog.open({
        template: 'modules/payments/client/views/templates/payment-vehicle.client.template.html',
        controller: 'PaymentVehicleController',
        appendClassName: 'ngdialog-custom',
        scope: $scope,
        showClose: false,
        closeByDocument: false
      });
      mDialog.closePromise.then(function (res) {
        if (!res.value || res.value === '$document') {
          delete $scope.vehicle;
          return;
        }
        vm.payment.vehicles.push(res.value);
        vm.handleCalculatePayment();
        delete $scope.vehicle;
      });
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
    function prepareOthers() {
      if (vm.payment.others.length === 0) return;
      for (var index = 0; index < vm.payment.others.length; index++) {
        var other = vm.payment.others[index];
        _.extend(other, ui_config.other);
      }
    }
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
    function prepareMeetings() {
      if (vm.payment.meetings.length === 0) return;
      for (var index = 0; index < vm.payment.meetings.length; index++) {
        var meeting = vm.payment.meetings[index];
        _.extend(meeting, ui_config.meeting);
      }
    }
    vm.handleAddMeeting = function () {
      var meeting = {
        id: new Date().getTime(),
        account: 0,
        kind: 0,
        fee: 0,
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
