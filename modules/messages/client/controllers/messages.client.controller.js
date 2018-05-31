(function () {
  'use strict';

  // Messages controller
  angular
    .module('messages')
    .controller('MessagesController', MessagesController);

  MessagesController.$inject = ['$scope', '$state', 'messageResolve', 'AdminUserApi', 'CommonService', 'DepartmentsApi', '$q'];

  function MessagesController($scope, $state, message, AdminUserApi, CommonService, DepartmentsApi, $q) {
    var vm = this;

    vm.message = message;
    vm.message.destination = 1;
    vm.form = {};

    vm.handleDestinationChanged = function () {
      // console.log(vm.message.destination);
      vm.message.users = [];
      vm.message.deparments = [];
    };
    vm.handleSearchUsers = function ($query) {
      if (CommonService.isStringEmpty($query)) {
        return [];
      }

      var deferred = $q.defer();
      AdminUserApi.searchUsers({ key: $query, department: false })
        .success(users => {
          deferred.resolve(users);
        });

      return deferred.promise;
    };
    vm.handleSearchDepartments = function ($query) {
      if (CommonService.isStringEmpty($query)) {
        return [];
      }

      var deferred = $q.defer();
      DepartmentsApi.search({ key: $query })
        .success(departments => {
          deferred.resolve(departments);
        });

      return deferred.promise;
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
