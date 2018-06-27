(function () {
  'use strict';
  // Polls controller
  angular.module('payments')
    .controller('PaymentTripController', PaymentTripController);

  PaymentTripController.$inject = [
    '$scope',
    'FileUploader',
    'CommonService'
  ];


  function PaymentTripController($scope, FileUploader, CommonService) {

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
        $scope.trip.receipts.push(response);
      };
      $scope.uploader.onCompleteAll = function () {
        $scope.uploader.clearQueue();
        $scope.closeThisDialog($scope.trip);
      };
    }

    $scope.handleSaveTransport = function () {
      if (!validateTransport()) {
        return $scope.handleShowToast('データが不足です！', true);
      }

      $scope.handleShowConfirm({
        message: '交通費を保存しますか？'
      }, function () {
        if ($scope.uploader.queue.length > 0) {
          $scope.uploader.uploadAll();
        } else {
          $scope.closeThisDialog($scope.trip);
        }
      });
    };

    function validateTransport() {
      var error = true;
      if (!$scope.trip.date || !moment($scope.trip.date).isValid()) {
        $scope.trip.date_error = true;
        error = false;
      } else {
        $scope.trip.date_error = false;
      }
      if (CommonService.isStringEmpty($scope.trip.content)) {
        $scope.trip.content_error = true;
        error = false;
      } else {
        $scope.trip.content_error = false;
      }
      if (CommonService.isStringEmpty($scope.trip.start)) {
        $scope.trip.start_error = true;
        error = false;
      } else {
        $scope.trip.start_error = false;
      }
      if (CommonService.isStringEmpty($scope.trip.end)) {
        $scope.trip.end_error = true;
        error = false;
      } else {
        $scope.trip.end_error = false;
      }
      if ($scope.trip.method === 0 && CommonService.isStringEmpty($scope.trip.method_other)) {
        $scope.trip.method_error = true;
        error = false;
      } else {
        $scope.trip.method_error = false;
      }
      return error;
    }
  }
})();
