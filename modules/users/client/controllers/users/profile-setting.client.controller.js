'use strict';

angular
  .module('users')
  .controller('ProfileSettingController', ProfileSettingController);

ProfileSettingController.$inject = ['$scope', '$state', 'UserApi', 'Authentication'];

function ProfileSettingController($scope, $state, UserApi, Authentication) {

  $scope.password_busy = false;
  $scope.info_busy = false;

  onCreate();
  function onCreate() {
    prepareUserInfo();
  }

  function prepareUserInfo() {
    $scope.userInfo = _.pick($scope.user, '_id', 'private');
    if ($scope.userInfo.private.birthdate) {
      $scope.new_birthdate = moment($scope.userInfo.private.birthdate).format('YYYY/MM/DD');
    }
  }

  $scope.handleChangePassword = function (isValid) {
    if (!isValid) {
      $scope.$broadcast('show-errors-check-validity', 'passwordForm');
      return false;
    }
    if ($scope.password_busy) return;
    $scope.password_busy = true;
    UserApi.password($scope.passwordDetails)
      .success(function (response) {
        $scope.$broadcast('show-errors-reset', 'passwordForm');
        delete $scope.passwordDetails;
        $scope.password_busy = false;
        $scope.handleShowToast('パスワードを変更しました。', false);
      }).error(function (err) {
        $scope.password_busy = false;
        $scope.handleShowToast(err.message, true);
      });
  };
  $scope.handleSaveInfo = function () {
    if ($scope.info_busy) return;
    $scope.info_busy = true;

    if ($scope.new_birthdate) {
      $scope.userInfo.private.birthdate = $scope.new_birthdate;
    }

    UserApi.profile($scope.userInfo)
      .success(function (res) {
        $scope.handleShowToast('個人情報を変更しました。', false);
        _.extend(Authentication.user.private, res.private);
        $scope.info_busy = false;
      }).error(function (err) {
        prepareUserInfo();
        $scope.handleShowToast(err.message, true);
        $scope.info_busy = false;
      });
  };
}
