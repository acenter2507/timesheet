(function () {
  'use strict';
  // Polls controller
  angular.module('payments')
    .controller('PaymentVehicleController', PaymentVehicleController);

  PaymentVehicleController.$inject = [
    '$scope',
    'FileUploader',
    'CommonService'
  ];


  function PaymentVehicleController($scope, FileUploader, CommonService) {

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
        $scope.vehicle.receipts.push(response);
      };
      $scope.uploader.onCompleteAll = function () {
        $scope.uploader.clearQueue();
        $scope.closeThisDialog($scope.vehicle);
      };
    }

    $scope.handleSaveVehicle = function () {
      if (!validateVehicle()) {
        return $scope.handleShowToast('データが不足です！', true);
      }

      $scope.handleShowConfirm({
        message: '交通費を保存しますか？'
      }, function () {
        if ($scope.uploader.queue.length > 0) {
          $scope.uploader.uploadAll();
        } else {
          $scope.closeThisDialog($scope.vehicle);
        }
      });
    };

    function validateVehicle() {
      var error = true;
      if (!$scope.vehicle.date || !moment($scope.vehicle.date).isValid()) {
        $scope.vehicle.date_error = true;
        error = false;
      } else {
        $scope.vehicle.date_error = false;
      }
      if (CommonService.isStringEmpty($scope.vehicle.content)) {
        $scope.vehicle.content_error = true;
        error = false;
      } else {
        $scope.vehicle.content_error = false;
      }
      if (CommonService.isStringEmpty($scope.vehicle.purpose)) {
        $scope.vehicle.purpose_error = true;
        error = false;
      } else {
        $scope.vehicle.purpose_error = false;
      }
      return error;
    }
  }
})();
