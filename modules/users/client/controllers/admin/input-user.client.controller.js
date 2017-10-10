'use strict';

angular.module('users.admin').controller('UserInputController', ['$scope', '$state', 'userResolve', 'DepartmentsService',
  function ($scope, $state, userResolve, DepartmentsService) {
    var vm = this;
    vm.form = {};
    vm.busy = false;

    onCreate();

    function onCreate() {
      vm.user = userResolve;
      if (!vm.user._id) {
        userResolve.private = { sex: 1 };
        userResolve.roles = ['user'];
      }
      prepareDepartments();
    }

    function prepareDepartments() {
      DepartmentsService.query(data => {
        vm.departments = data;
      });
    }
    vm.handleSaveUser = isValid => {
      if (vm.busy) return;
      vm.busy = true;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.userForm');
        vm.busy = false;
        return false;
      }
      vm.user.$save(() => {
        $state.go('users.view', { userId: vm.user._id });
        vm.busy = false;
      }, err => {
        $scope.handleShowToast(err.data.message, true);
        vm.busy = false;
      });
    };

    vm.handleCancelInput = () => {
      $state.go($state.previous.state.name || 'users.list', $state.previous.params);
    };

    vm.handleRemoveUser = () => {

    };
    // $scope.remove = function (user) {
    //   if (confirm('Are you sure you want to delete this user?')) {
    //     if (user) {
    //       user.$remove();

    //       $scope.users.splice($scope.users.indexOf(user), 1);
    //     } else {
    //       $scope.user.$remove(function () {
    //         $state.go('admin.users');
    //       });
    //     }
    //   }
    // };

    // $scope.update = function (isValid) {
    //   if (!isValid) {
    //     $scope.$broadcast('show-errors-check-validity', 'vm.form.userForm');

    //     return false;
    //   }

    //   var user = $scope.user;

    //   user.$update(function () {
    //     $state.go('admin.user', {
    //       userId: user._id
    //     });
    //   }, function (errorResponse) {
    //     $scope.error = errorResponse.data.message;
    //   });
    // };
  }
]);
