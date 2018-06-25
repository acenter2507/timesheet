(function () {
  'use strict';
  // Polls controller
  angular.module('payments')
    .controller('PaymentTransportController', PaymentTransportController);

  PaymentTransportController.$inject = [
    '$scope',
    'FileUploader'
  ];


  function PaymentTransportController($scope, FileUploader) {

    prepareUpload();

    function prepareUpload() {
      $scope.uploader = new FileUploader({
        url: 'api/payments/images',
        alias: 'imagesUpload'
      });
      $scope.uploader.filters.push({
        name: 'imageFilter',
        fn: function (item, options) {
          var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
          return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
      });
      $scope.uploader.onAfterAddingAll = function (addedFileItems) {
        console.info('onAfterAddingAll', addedFileItems);
      };
      $scope.uploader.onCompleteItem = function (fileItem, response, status, headers) {
        $scope.results.push(response);
      };
      $scope.uploader.onCompleteAll = function () {
        $scope.closeThisDialog($scope.results);
      };
    }
  }
})();
