(function () {
  'use strict';

  // Messages controller
  angular
    .module('messages')
    .controller('MessagesController', MessagesController);

  MessagesController.$inject = ['$scope', '$state', '$window', 'Authentication', 'messageResolve'];

  function MessagesController ($scope, $state, $window, Authentication, message) {
    var vm = this;

    vm.authentication = Authentication;
    vm.message = message;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Message
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.message.$remove($state.go('messages.list'));
      }
    }

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
