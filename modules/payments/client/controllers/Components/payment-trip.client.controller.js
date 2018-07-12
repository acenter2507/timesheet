(function () {
  'use strict';
  // Polls controller
  angular.module('payments')
    .controller('PaymentTripController', PaymentTripController);

  PaymentTripController.$inject = [
    '$scope',
    '$state',
    '$stateParams',
    'FileUploader',
    'CommonService',
    'PaymentFactory',
    'PaymentsService'
  ];


  function PaymentTripController($scope, $state, $stateParams, FileUploader, CommonService, PaymentFactory, PaymentsService) {
    var vm = this;
    vm.payment = {};
    vm.trip = {};
    vm.form = {};

    preparePayment();
    prepareUpload();

    function preparePayment() {
      if (PaymentFactory.payment) {
        vm.payment = PaymentFactory.payment;
        prepareTrip();
      } else {
        PaymentsService.get({
          paymentId: $stateParams.paymentId
        }).$promise.then(function (payment) {
          vm.payment = payment;
          prepareTrip();
        });
      }
    }
    function prepareTrip() {
      if (PaymentFactory.trip) {
        vm.trip = PaymentFactory.trip;
        _.extend(vm.trip, {
          is_open_picker: false,
          method_error: false,
          fee_error: false
        });
      } else if ($stateParams.trip) {
        vm.trip = _.findWhere(vm.payment.trips, { _id: $stateParams.trip });
        _.extend(vm.trip, {
          is_open_picker: false,
          method_error: false
        });
      } else {
        vm.trip = {
          method: 1,
          fee: 0,
          receipts: [],
          stay_fee: 0,
          is_open_picker: false,
          method_error: false
        };
      }
      if (vm.trip._id) {
        vm.trip.new_date = moment(vm.trip.date).format('YYYY/MM/DD');
      }
    }
    function prepareUpload() {
      vm.uploader = new FileUploader({
        url: 'api/payments/receipts',
        alias: 'paymentReceipts'
      });
      vm.uploader.filters.push({
        name: 'imageFilter',
        fn: function (item, options) {
          var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
          return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
      });
      vm.uploader.onBeforeUploadItem = function (item) {
        vm.uploadingFileName = item._file.name;
      };
      vm.uploader.onAfterAddingAll = function (addedFileItems) {
      };
      vm.uploader.onCompleteItem = function (fileItem, response, status, headers) {
        vm.trip.receipts.push(response);
      };
      vm.uploader.onCompleteAll = function () {
        vm.uploader.clearQueue();
        handleSavePayment();
      };
    }

    vm.handleSaveTrip = function (isValid) {
      var error = false;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.tripForm');
        error = true;
      }
      if (!validateTrip()) {
        error = true;
      }
      if (error) return false;

      $scope.handleShowConfirm({
        message: '出張旅費を保存しますか？'
      }, function () {
        if (vm.uploader.queue.length > 0) {
          vm.uploader.uploadAll();
        } else {
          handleSavePayment();
        }
      });
    };
    vm.handleChangeMethod = function () {
      if (vm.trip.method === 0 && CommonService.isStringEmpty(vm.trip.method_other)) {
        vm.trip.method_error = true;
      } else {
        vm.trip.method_error = false;
      }
    };
    vm.handleCancel = function () {
      PaymentFactory.deleteTrip();
      $state.go('payments.edit', { paymentId: vm.payment._id });
    };
    vm.handleDeleteReceipt = function (receipt) {
      PaymentsApi.deleteReceipt(vm.payment._id, receipt)
        .success(function () {
          vm.trip.receipts = _.without(vm.trip.receipts, receipt);
          var trip = _.findWhere(vm.payment.trips, { _id: vm.trip._id });
          trip.receipts = vm.trip.receipts;
          PaymentFactory.update(vm.payment);
        })
        .error(function (err) {
          $scope.handleShowToast(err.message, true);
        });
    };
    function handleSavePayment() {
      if (vm.trip._id) {
        var trip = _.findWhere(vm.payment.trips, { _id: vm.trip._id });
        _.extend(trip, vm.trip);
      } else {
        vm.payment.trips.push(vm.trip);
      }

      vm.trip.date = vm.trip.new_date;
      vm.payment.$update(function (payment) {
        PaymentFactory.update(payment);
        PaymentFactory.deleteTrip();
        $state.go('payments.edit', { paymentId: vm.payment._id });
      }, function (err) {
        $scope.handleShowToast(err.message, true);
      });
    }
    function validateTrip() {
      var error = true;
      if (vm.trip.method === 0 && CommonService.isStringEmpty(vm.trip.method_other)) {
        vm.trip.method_error = true;
        error = false;
      } else {
        vm.trip.method_error = false;
      }
      return error;
    }
  }
})();
