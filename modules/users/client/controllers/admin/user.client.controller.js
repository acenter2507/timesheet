'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'userResolve',
  function ($scope, $state, userResolve) {
    var vm = this;
    vm.user = userResolve;

    onCreate();

    function onCreate() {
      prepareSecurityCheck();
    }

    function prepareSecurityCheck() {
      if (!$scope.isAdmin && !$scope.isAccountant) {
        handlePreviousScreen();
        return $scope.handleShowToast('このページを表示する権限がありません。', true);
      }
      if (vm.user.status === 3 && !$scope.isAdmin) {
        handlePreviousScreen();
        return $scope.handleShowToast('このユーザーが削除されました。', true);
      }
    }
    // Trở về màn hình trước
    function handlePreviousScreen() {
      $state.go($state.previous.state.name || 'home', $state.previous.params);
    }

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
    //     $scope.$broadcast('show-errors-check-validity', 'userForm');

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
