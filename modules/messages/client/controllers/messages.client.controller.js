(function () {
  'use strict';

  // Messages controller
  angular
    .module('messages')
    .controller('MessagesController', MessagesController);

  MessagesController.$inject = ['$scope', '$state', 'messageResolve'];

  function MessagesController ($scope, $state, message) {
    var vm = this;

    vm.message = message;
    vm.message.destination = 1;
    vm.form = {};

    vm.handleDestinationChanged = function() {
      console.log(vm.message.destination);
    };

    // Save Message
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.messageForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.message._id) {
        vm.message.$update(successCallback, errorCallback);
      } else {
        vm.message.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('messages.view', {
          messageId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
