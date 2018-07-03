(function () {
  'use strict';
  // Polls controller
  angular.module('payments')
    .controller('PaymentMeetingController', PaymentMeetingController);

  PaymentMeetingController.$inject = [
    '$scope',
    '$state',
    '$stateParams',
    'FileUploader',
    'CommonService',
    'PaymentFactory',
    'PaymentsService'
  ];


  function PaymentMeetingController($scope, $state, $stateParams, FileUploader, CommonService, PaymentFactory, PaymentsService) {
    var vm = this;
    vm.payment = {};
    vm.meeting = {};
    vm.form = {};

    preparePayment();
    prepareUpload();

    function preparePayment() {
      if (PaymentFactory.payment) {
        vm.payment = PaymentFactory.payment;
        prepareMeeting();
      } else {
        PaymentsService.get({
          paymentId: $stateParams.paymentId
        }).$promise.then(function (payment) {
          vm.payment = payment;
          prepareMeeting();
        });
      }
    }
    function prepareMeeting() {
      if (PaymentFactory.meeting) {
        vm.meeting = PaymentFactory.meeting;
      } else if ($stateParams.meeting) {
        vm.meeting = _.findWhere(vm.payment.meetings, { _id: $stateParams.meeting });
      } else {
        vm.meeting = {
          account: 1,
          kind: 1,
          fee: 0,
          partners: [''],
          employees: [''],
          receipts: []
        };
      }
      _.extend(vm.meeting, {
        is_open_picker: false,
        account_error: false,
        kind_error: false
      });
      if (vm.meeting._id) {
        vm.meeting.new_date = moment(vm.meeting.date).format('YYYY/MM/DD');
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
        vm.meeting.receipts.push(response);
      };
      vm.uploader.onCompleteAll = function () {
        vm.uploader.clearQueue();
        handleSavePayment();
      };
    }

    vm.handleSaveMeeting = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.meetingForm');
        return false;
      }
      if (!validateMeeting()) {
        return $scope.handleShowToast('データが不足です！', true);
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

    vm.handleAddPartner = function () {
      vm.meeting.partners.push('');
    };
    vm.handleAddEmployee = function () {
      vm.meeting.employees.push('');
    };
    vm.handleRemovePartner = function (partner) {
      vm.meeting.partners = _.without(vm.meeting.partners, partner);
    };
    vm.handleRemoveEmployee = function (employee) {
      vm.meeting.employees = _.without(vm.meeting.employees, employee);
    };
    vm.handleChangeAccount = function () {
      if (vm.meeting.account === 0 && CommonService.isStringEmpty(vm.meeting.account_other)) {
        vm.meeting.account_error = true;
        error = false;
      } else {
        vm.meeting.account_error = false;
      }
    };
    vm.handleChangeKind = function () {
      if (vm.meeting.kind === 0 && CommonService.isStringEmpty(vm.meeting.kind_other)) {
        vm.meeting.kind_error = true;
        error = false;
      } else {
        vm.meeting.kind_error = false;
      }
    };

    function validateMeeting() {
      var error = true;
      if (vm.meeting.account === 0 && CommonService.isStringEmpty(vm.meeting.account_other)) {
        vm.meeting.account_error = true;
        error = false;
      } else {
        vm.meeting.account_error = false;
      }
      if (vm.meeting.kind === 0 && CommonService.isStringEmpty(vm.meeting.kind_other)) {
        vm.meeting.kind_error = true;
        error = false;
      } else {
        vm.meeting.kind_error = false;
      }
      return error;
    }
  }
})();
