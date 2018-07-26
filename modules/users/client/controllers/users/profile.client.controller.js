(function () {
  'use strict';

  // Workrests controller
  angular
    .module('users')
    .controller('ProfileController', ProfileController);

  ProfileController.$inject = ['$scope', '$state', 'UserApi', '$stateParams'];

  function ProfileController($scope, $state, UserApi, $stateParams) {
    var vm = this;

    onCreate();
    function onCreate() {
      prepareProfile();
    }
    function prepareProfile() {
      UserApi.profile($stateParams.userId)
        .success(function (res) {
          vm.profile = res;
        })
        .error(function (err) {
          $scope.handleShowToast(err.message, true);
        });
    }
  }
}());
