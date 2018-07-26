'use strict';

angular
  .module('users')
  .controller('ProfileSettingController', ProfileSettingController);

ProfileSettingController.$inject = ['$scope', '$state'];

function ProfileSettingController($scope, $state) {

  $scope.busy = false;

  onCreate();
  function onCreate() {
    if ($scope.user.birthdate) {
      $scope.new_birthdate = moment($scope.user.birthdate).format('YYYY/MM/DD');
    }

  }

  $scope.changeUserPassword = function (isValid) {
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
