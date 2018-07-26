'use strict';

angular
  .module('users')
  .controller('ProfileSettingController', ProfileSettingController);

ProfileSettingController.$inject = ['$scope', '$state', '$stateParams'];

function ProfileSettingController($scope, $state, $stateParams) {
  $scope.tabs = [
    { title: '個人情報', active: true },
    { title: 'パスワード変更', active: false }
  ];
  onCreate();
  function onCreate() {
    console.log($stateParams.action);
    if ($stateParams.action) {
      if ($stateParams.action === 1) {
        $scope.tabs[0].active = true;
      } else if ($stateParams.action === 2) {
        $scope.tabs[1].active = true;
      }
    }
  }
}
