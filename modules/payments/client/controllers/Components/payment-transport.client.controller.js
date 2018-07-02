(function () {
  'use strict';
  // Polls controller
  angular.module('payments')
    .controller('PaymentTransportController', PaymentTransportController);

  PaymentTransportController.$inject = [
    '$scope',
    'FileUploader',
    'CommonService',
    'PaymentFactory'
  ];


  function PaymentTransportController($scope, FileUploader, CommonService, PaymentFactory) {
    vm = this;
    vm.transport = {};

    prepareTransport();
    prepareUpload();

    function prepareTransport() {
      if (PaymentFactory.transport) {
        vm.transport = PaymentFactory.transport;
        _.extend(vm.transport, {
          is_open_picker: false,
          date_error: false,
          content_error: false,
          start_error: false,
          end_error: false,
          method_error: false,
          fee_error: false
        });
      } else {
        vm.transport = {
          id: new Date().getTime(),
          method: 1,
          fee: 0,
          receipts: [],
          taxi_fee: 0,
          is_open_picker: false,
          date_error: false,
          content_error: false,
          start_error: false,
          end_error: false,
          method_error: false,
          fee_error: false
        };
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
        vm.transport.receipts.push(response);
      };
      vm.uploader.onCompleteAll = function () {
        vm.uploader.clearQueue();
        // TODO
      };
    }

    vm.handleSaveTransport = function () {
      if (!validateTransport()) {
        return $scope.handleShowToast('データが不足です！', true);
      }

      vm.handleShowConfirm({
        message: '交通費を保存しますか？'
      }, function () {
        if (vm.uploader.queue.length > 0) {
          vm.uploader.uploadAll();
        } else {
          // TODO
        }
      });
    };

    function validateTransport() {
      var error = true;
      if (!vm.transport.date || !moment(vm.transport.date).isValid()) {
        vm.transport.date_error = true;
        error = false;
      } else {
        vm.transport.date_error = false;
      }
      if (CommonService.isStringEmpty(vm.transport.content)) {
        vm.transport.content_error = true;
        error = false;
      } else {
        vm.transport.content_error = false;
      }
      if (CommonService.isStringEmpty(vm.transport.start)) {
        vm.transport.start_error = true;
        error = false;
      } else {
        vm.transport.start_error = false;
      }
      if (CommonService.isStringEmpty(vm.transport.end)) {
        vm.transport.end_error = true;
        error = false;
      } else {
        vm.transport.end_error = false;
      }
      if (vm.transport.method === 0 && CommonService.isStringEmpty(vm.transport.method_other)) {
        vm.transport.method_error = true;
        error = false;
      } else {
        vm.transport.method_error = false;
      }
      if (vm.transport.fee === 0 && vm.transport.taxi_fee === 0) {
        vm.transport.fee_error = true;
        error = false;
      } else {
        vm.transport.fee_error = false;
      }
      return error;
    }
  }
})();
