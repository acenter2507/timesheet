'use strict';

angular.module('users').controller('ChangePasswordController', ['$scope', '$http',
  function ($scope, $http) {
    // Change user password
    $scope.changeUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'passwordForm');
        return false;
      }

      $http.post('/api/users/password', $scope.passwordDetails).success(function (response) {
        $scope.$broadcast('show-errors-reset', 'passwordForm');
        $scope.handleShowToast('パスワードを変更しました。', false);
        $scope.passwordDetails = null;
      }).error(function (err) {
        $scope.handleShowToast(err.message, true);
      });
    };
  }
]);
