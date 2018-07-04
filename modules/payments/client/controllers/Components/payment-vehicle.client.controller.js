(function () {
  'use strict';
  // Polls controller
  angular.module('payments')
    .controller('PaymentVehicleController', PaymentVehicleController);

  PaymentVehicleController.$inject = [
    '$scope',
    '$state',
    '$stateParams',
    'FileUploader',
    'CommonService',
    'PaymentFactory',
    'PaymentsService'
  ];

  function PaymentVehicleController($scope, $state, $stateParams, FileUploader, CommonService, PaymentFactory, PaymentsService) {
    var vm = this;
    vm.payment = {};
    vm.vehicle = {};
    vm.form = {};

    preparePayment();
    prepareUpload();

    function preparePayment() {
      if (PaymentFactory.payment) {
        vm.payment = PaymentFactory.payment;
        prepareVehicle();
      } else {
        PaymentsService.get({
          paymentId: $stateParams.paymentId
        }).$promise.then(function (payment) {
          vm.payment = payment;
          prepareVehicle();
        });
      }
    }
    function prepareVehicle() {
      if (PaymentFactory.vehicle) {
        vm.vehicle = PaymentFactory.vehicle;
      } else if ($stateParams.vehicle) {
        vm.vehicle = _.findWhere(vm.payment.vehicles, { _id: $stateParams.vehicle });
      } else {
        vm.vehicle = {
          method: 1,
          fee: 0,
          receipts: [],
          taxi_fee: 0
        };
      }
      _.extend(vm.vehicle, { is_open_picker: false });
      if (vm.vehicle._id) {
        vm.vehicle.new_date = moment(vm.vehicle.date).format('YYYY/MM/DD');
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
        vm.vehicle.receipts.push(response);
      };
      vm.uploader.onCompleteAll = function () {
        vm.uploader.clearQueue();
        handleSavePayment();
      };
    }

    vm.handleSaveVehicle = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.vehicleForm');
        return false;
      }

      $scope.handleShowConfirm({
        message: '車両燃料費を保存しますか？'
      }, function () {
        if (vm.uploader.queue.length > 0) {
          vm.uploader.uploadAll();
        } else {
          handleSavePayment();
        }
      });
    };
    vm.handleCancel = function () {
      $state.go('payments.edit', { paymentId: vm.payment._id });
    };
    function handleSavePayment() {
      if (vm.vehicle._id) {
        var vehicle = _.findWhere(vm.payment.vehicles, { _id: vm.vehicle._id });
        _.extend(vehicle, vm.vehicle);
      } else {
        vm.payment.vehicles.push(vm.vehicle);
      }

      vm.vehicle.date = vm.vehicle.new_date;
      vm.payment.$update(function (payment) {
        PaymentFactory.update(payment);
        PaymentFactory.deleteVehicle();
        $state.go('payments.edit', { paymentId: vm.payment._id });
      }, function (err) {
        $scope.handleShowToast(err.message, true);
      });
    }
  }
})();
