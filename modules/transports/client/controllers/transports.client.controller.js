(function () {
  'use strict';

  // Transports controller
  angular
    .module('transports')
    .controller('TransportsController', TransportsController);

  TransportsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'transportResolve'];

  function TransportsController ($scope, $state, $window, Authentication, transport) {
    var vm = this;

    vm.authentication = Authentication;
    vm.transport = transport;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Transport
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.transport.$remove($state.go('transports.list'));
      }
    }

    // Save Transport
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.transportForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.transport._id) {
        vm.transport.$update(successCallback, errorCallback);
      } else {
        vm.transport.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('transports.view', {
          transportId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
