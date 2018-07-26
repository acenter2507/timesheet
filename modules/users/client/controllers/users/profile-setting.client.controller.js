'use strict';

angular
  .module('users')
  .controller('ProfileSettingController', ProfileSettingController);

ProfileSettingController.$inject = ['$scope', '$state', '$stateParams'];

function ProfileSettingController($scope, $state, $stateParams) {
  $scope.action = $stateParams.action || 1;
}
