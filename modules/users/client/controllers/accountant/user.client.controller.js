'use strict';

angular.module('users.admin')
  .controller('AccountantUserController', AccountantUserController);

AccountantUserController.$inject = [
  '$scope',
  'userResolve',
  'CommonService',
  '$q'
];

function AccountantUserController(
  $scope,
  userResolve,
  CommonService,
  $q
) {
  var vm = this;
  vm.user = userResolve;
  vm.busy = false;

  vm.handleSaveUser = function (isValid) {
    if (!isValid) {
      $scope.$broadcast('show-errors-check-validity', 'vm.form.userForm');
      return false;
    }
    if (vm.busy) return;
    vm.busy = true;

    vm.user.$update(successCallback, errorCallback);

    function successCallback(res) {
      vm.busy = false;
      _.extend(vm.user, res);
      $scope.handleShowToast('社員の情報を保存しました！', false);
    }

    function errorCallback(err) {
      vm.busy = false;
      $scope.handleShowToast(err.data.message, true);
    }

  };
  vm.handleSearchDepartments = function ($query) {
    if (CommonService.isStringEmpty($query)) {
      return [];
    }

    var deferred = $q.defer();
    CommonService.autocompleteDepartments({ key: $query })
      .success(function (departments) {
        deferred.resolve(departments);
      });

    return deferred.promise;
  };
}