(function () {
  'use strict';
  // Polls controller
  angular.module('payments')
    .controller('PaymentTransportController', PaymentTransportController);

  PaymentTransportController.$inject = [
    '$scope',
    'FileUploader',
    'CommonService'
  ];


  function PaymentTransportController($scope, FileUploader, CommonService) {

    $scope.receipts = [];
    prepareUpload();

    function prepareUpload() {
      $scope.uploader = new FileUploader({
        url: 'api/payments/receipts',
        alias: 'paymentReceipts'
      });
      $scope.uploader.filters.push({
        name: 'imageFilter',
        fn: function (item, options) {
          var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
          return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
      });
      $scope.uploader.onBeforeUploadItem = function (item) {
        $scope.uploadingFileName = item._file.name;
      };
      $scope.uploader.onAfterAddingAll = function (addedFileItems) {
      };
      $scope.uploader.onCompleteItem = function (fileItem, response, status, headers) {
        $scope.transport.receipts.push(response);
      };
      $scope.uploader.onCompleteAll = function () {
        $scope.uploader.clearQueue();
        $scope.closeThisDialog($scope.transport);
      };
    }

    $scope.handleSaveTransport = function () {
      if (!validateTransport()) {
        if (!$scope.$$phase) $scope.$digest();
        return;
      }

      $scope.handleShowConfirm({
        message: '交通費を保存しますか？'
      }, function () {
        console.log($scope.transport);
        if (!$scope.$$phase) $scope.$digest();
        return;
        // if ($scope.uploader.queue.length > 0) {
        //   $scope.uploader.uploadAll();
        // } else {
        //   $scope.closeThisDialog($scope.transport);
        // }
      });
    };

    function validateTransport() {
      var error = false;
      if (!$scope.transport.date || !moment($scope.transport.date).isValid()) {
        $scope.transport.date_error = true;
        error = true;
      } else {
        $scope.transport.date_error = false;
      }
      if (CommonService.isStringEmpty($scope.transport.content)) {
        $scope.transport.content_error = true;
        error = true;
      } else {
        $scope.transport.content_error = false;
      }
      if (CommonService.isStringEmpty($scope.transport.start)) {
        $scope.transport.start_error = true;
        error = true;
      } else {
        $scope.transport.start_error = false;
      }
      if (CommonService.isStringEmpty($scope.transport.end)) {
        $scope.transport.end_error = true;
        error = true;
      } else {
        $scope.transport.end_error = false;
      }
      if ($scope.transport.method === 0 && CommonService.isStringEmpty($scope.transport.method_other)) {
        $scope.transport.method_error = true;
        error = true;
      } else {
        $scope.transport.method_error = false;
      }
      if ($scope.transport.fee === 0 && $scope.transport.taxi_fee === 0) {
        $scope.transport.fee_error = true;
        error = true;
      } else {
        $scope.transport.fee_error = false;
      }
      return error;
    }
  }
})();
