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
    console.log($scope.transport);
  }
})();
