'use strict';

angular
  .module('users')
  .controller('ProfileSettingController', ProfileSettingController);

ProfileSettingController.$inject = ['$scope', '$state'];

function ProfileSettingController($scope, $state) {
  onCreate();
  function onCreate() {
    if (!$scope.user.birthdate) {
      $scope.new_birthdate = moment($scope.user.birthdate).format('YYYY/MM/DD');
    }

  }
}
