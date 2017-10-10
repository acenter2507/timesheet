'use strict';

angular.module('users.admin').controller('UserInputController', ['$scope', '$state', 'AdminUserService',
  function ($scope, $state, AdminUserService) {
    var vm = this;
    vm.user = new AdminUserService({
      private: { sex: 1 },
      roles: 'user'
    });
    vm.form = {};

    vm.handleSaveUser = isValid => {
      
    };

    $scope.remove = function (user) {
      if (confirm('Are you sure you want to delete this user?')) {
        if (user) {
          user.$remove();

          $scope.users.splice($scope.users.indexOf(user), 1);
        } else {
          $scope.user.$remove(function () {
            $state.go('admin.users');
          });
        }
      }
    };

    $scope.update = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.userForm');

        return false;
      }

      var user = $scope.user;

      user.$update(function () {
        $state.go('admin.user', {
          userId: user._id
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
  }
]);
