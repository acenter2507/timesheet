(function () {
  'use strict';
  // Polls controller
  angular.module('payments')
    .controller('PaymentOtherController', PaymentOtherController);

  PaymentOtherController.$inject = [
    '$scope',
    'FileUploader',
    'CommonService'
  ];


  function PaymentOtherController($scope, FileUploader, CommonService) {

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
        $scope.other.receipts.push(response);
      };
      $scope.uploader.onCompleteAll = function () {
        $scope.uploader.clearQueue();
        $scope.closeThisDialog($scope.other);
      };
    }

    $scope.handleSaveOther = function () {
      if (!validateOther()) {
        return $scope.handleShowToast('データが不足です！', true);
      }

      $scope.handleShowConfirm({
        message: '交通費を保存しますか？'
      }, function () {
        if ($scope.uploader.queue.length > 0) {
          $scope.uploader.uploadAll();
        } else {
          $scope.closeThisDialog($scope.other);
        }
      });
    };

    function validateOther() {
      var error = true;
      if (!$scope.other.date || !moment($scope.other.date).isValid()) {
        $scope.other.date_error = true;
        error = false;
      } else {
        $scope.other.date_error = false;
      }
      if (CommonService.isStringEmpty($scope.other.content)) {
        $scope.other.content_error = true;
        error = false;
      } else {
        $scope.other.content_error = false;
      }
      return error;
    }
  }
})();
