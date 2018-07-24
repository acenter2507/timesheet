'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication',
  function ($scope, $http, $location, Users, Authentication) {

    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = new Users($scope.user);

      user.$update(function (res) {
        $scope.$broadcast('show-errors-reset', 'userForm');
        $scope.handleShowToast('個人情報を変更しました。', false);
        Authentication.user = res;
      }, function (err) {
        $scope.handleShowToast(err.message, false);
      });
    };
  }
]);
