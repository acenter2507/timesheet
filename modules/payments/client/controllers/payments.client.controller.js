(function () {
  'use strict';

  // Payments controller
  angular
    .module('payments')
    .controller('PaymentsController', PaymentsController);

  PaymentsController.$inject = ['$scope', '$state', 'paymentResolve'];

  function PaymentsController($scope, $state, payment) {
    var vm = this;

    vm.payment = payment;
    vm.form = {};

    var ui_config = {
      transport: {
        is_open_picker: false,
        date_error: false,
        content_error: false,
        start_error: false,
        end_error: false,
        method_error: false,
        fee_error: false,
        receipt_error: false
      }
    };

    onCreate();
    function onCreate() {
      console.log(vm.payment);
      prepareTranspot();
    }

    function prepareTranspot() {
      if (vm.payment.transports.length === 0) return;
      for (var index = 0; index < vm.payment.transports.length; index++) {
        var transport = vm.payment.transports[index];
        _.extend(transport, ui_config.transport);
      }
    }

    vm.handleSavePayments = function () {
      // Verify Payments

      $scope.handleShowConfirm({
        message: '清算表を保存しますか？'
      }, function () {
        // PaymentsApi.request(item.payment._id)
        //   .success(function (data) {
        //     _.extend(item.payment, data);
        //   })
        //   .error(function (err) {
        //     $scope.handleShowToast(err.message, true);
        //   });
      });
    };
    vm.handleAddTransport = function () {
      var new_transport = { id: new Date().getTime() };
      _.extend(new_transport, ui_config.transport);
      vm.payment.transports.push(new_transport);
    };
    vm.handleRemoveTransport = function (transport) {
      $scope.handleShowConfirm({
        message: '交通費を削除しますか？'
      }, function () {
        vm.payment.transports = _.without(vm.payment.transports, transport);
      });
    };


    // Remove existing Payment
    // function remove() {
    //   if ($window.confirm('Are you sure you want to delete?')) {
    //     vm.payment.$remove($state.go('payments.list'));
    //   }
    // }

    // // Save Payment
    // function save(isValid) {
    //   if (!isValid) {
    //     $scope.$broadcast('show-errors-check-validity', 'vm.form.paymentForm');
    //     return false;
    //   }

    //   // TODO: move create/update logic to service
    //   if (vm.payment._id) {
    //     vm.payment.$update(successCallback, errorCallback);
    //   } else {
    //     vm.payment.$save(successCallback, errorCallback);
    //   }

    //   function successCallback(res) {
    //     $state.go('payments.view', {
    //       paymentId: res._id
    //     });
    //   }

    //   function errorCallback(res) {
    //     vm.error = res.data.message;
    //   }
    // }
  }
}());
