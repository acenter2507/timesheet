(function () {
  'use strict';
  // Polls controller
  angular.module('payments')
    .controller('PaymentMeetingController', PaymentMeetingController);

  PaymentMeetingController.$inject = [
    '$scope',
    'FileUploader',
    'CommonService'
  ];


  function PaymentMeetingController($scope, FileUploader, CommonService) {

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
        $scope.meeting.receipts.push(response);
      };
      $scope.uploader.onCompleteAll = function () {
        $scope.uploader.clearQueue();
        $scope.closeThisDialog($scope.meeting);
      };
    }

    $scope.handleSaveMeeting = function () {
      if (!validateMeeting()) {
        return $scope.handleShowToast('データが不足です！', true);
      }

      $scope.handleShowConfirm({
        message: '交通費を保存しますか？'
      }, function () {
        if ($scope.uploader.queue.length > 0) {
          $scope.uploader.uploadAll();
        } else {
          $scope.closeThisDialog($scope.meeting);
        }
      });
    };
    $scope.handleAddPartner = function () {
      $scope.meeting.partners.push('');
    };
    $scope.handleAddEmployee = function () {
      $scope.meeting.employees.push('');
    };
    $scope.handleRemovePartner = function (partner) {
      $scope.meeting.partners = _.without($scope.meeting.partners, partner);
    };
    $scope.handleRemoveEmployee = function (employee) {
      $scope.meeting.employees = _.without($scope.meeting.employees, employee);
    };

    function validateMeeting() {
      var error = true;
      if (!$scope.meeting.date || !moment($scope.meeting.date).isValid()) {
        $scope.meeting.date_error = true;
        error = false;
      } else {
        $scope.meeting.date_error = false;
      }
      if (CommonService.isStringEmpty($scope.meeting.content)) {
        $scope.meeting.content_error = true;
        error = false;
      } else {
        $scope.meeting.content_error = false;
      }
      if ($scope.meeting.account === 0 && CommonService.isStringEmpty($scope.meeting.account_other)) {
        $scope.meeting.account_error = true;
        error = false;
      } else {
        $scope.meeting.account_error = false;
      }
      if ($scope.meeting.kind === 0 && CommonService.isStringEmpty($scope.meeting.kind_other)) {
        $scope.meeting.kind_error = true;
        error = false;
      } else {
        $scope.meeting.kind_error = false;
      }
      return error;
    }
  }
})();
