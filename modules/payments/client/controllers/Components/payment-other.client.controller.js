(function () {
  'use strict';
  // Polls controller
  angular.module('payments')
    .controller('PaymentOtherController', PaymentOtherController);

  PaymentOtherController.$inject = [
    '$scope',
    '$state',
    '$stateParams',
    'FileUploader',
    'PaymentFactory',
    'PaymentsService',
    'PaymentsApi'
  ];


  function PaymentOtherController(
    $scope,
    $state,
    $stateParams,
    FileUploader,
    PaymentFactory,
    PaymentsService,
    PaymentsApi
  ) {
    var vm = this;
    vm.payment = {};
    vm.other = {};
    vm.form = {};

    preparePayment();
    prepareUpload();

    function preparePayment() {
      if (PaymentFactory.payment) {
        vm.payment = PaymentFactory.payment;
        prepareOther();
      } else {
        PaymentsService.get({
          paymentId: $stateParams.paymentId
        }).$promise.then(function (payment) {
          vm.payment = payment;
          prepareOther();
        });
      }
    }
    function prepareOther() {
      if (PaymentFactory.other) {
        vm.other = PaymentFactory.other;
      } else if ($stateParams.other) {
        vm.other = _.findWhere(vm.payment.others, { _id: $stateParams.other });
      } else {
        vm.other = {
          kind: 1,
          fee: 0,
          receipts: []
        };
      }
      _.extend(vm.other, { is_open_picker: false });
      if (vm.other._id) {
        vm.other.new_date = moment(vm.other.date).format('YYYY/MM/DD');
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
        vm.other.receipts.push(response);
      };
      vm.uploader.onCompleteAll = function () {
        vm.uploader.clearQueue();
        handleSavePayment();
      };
    }

    vm.handleSaveOther = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.otherForm');
        return false;
      }

      $scope.handleShowConfirm({
        message: 'その他の費用を保存しますか？'
      }, function () {
        if (vm.uploader.queue.length > 0) {
          vm.uploader.uploadAll();
        } else {
          handleSavePayment();
        }
      });
    };
    vm.handleCancel = function () {
      PaymentFactory.deleteOther();
      $state.go('payments.edit', { paymentId: vm.payment._id });
    };
    vm.handleDeleteReceipt = function (receipt) {
      PaymentsApi.deleteReceipt(vm.payment._id, receipt)
        .success(function () {
          vm.other.receipts = _.without(vm.other.receipts, receipt);
          var other = _.findWhere(vm.payment.others, { _id: vm.other._id });
          other.receipts = vm.other.receipts;
          PaymentFactory.update(vm.other);
        })
        .error(function (err) {
          $scope.handleShowToast(err.message, true);
        });
    };
    function handleSavePayment() {
      if (vm.other._id) {
        var other = _.findWhere(vm.payment.others, { _id: vm.other._id });
        _.extend(other, vm.other);
      } else {
        vm.payment.others.push(vm.other);
      }

      vm.other.date = vm.other.new_date;
      vm.payment.$update(function (payment) {
        PaymentFactory.update(payment);
        PaymentFactory.deleteOther();
        $state.go('payments.edit', { paymentId: vm.payment._id });
      }, function (err) {
        $scope.handleShowToast(err.message, true);
      });
    }
  }
})();
