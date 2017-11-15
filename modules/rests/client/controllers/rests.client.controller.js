(function () {
  'use strict';

  // Rests controller
  angular
    .module('rests')
    .controller('RestsController', RestsController);

  RestsController.$inject = ['$scope', '$state', 'restResolve', 'CommonService'];

  function RestsController ($scope, $state, rest, CommonService) {
    var vm = this;
    vm.rest = rest;
    console.log(vm.rest);

    function onCreate() {
      prepareSecurity();
    }
    function prepareSecurity() {
      // 自分の休暇
      if (vm.rest.isCurrentUserOwner) return;
      // 他人の休暇で自分がリーダじゃない場合
      if (!vm.rest.isCurrentUserOwner && !$scope.isLeader) {
        $scope.handleShowToast('権限が必要です。', true);
        return handlePreviousScreen();
      }
      // 休暇の本人のリーダじゃない場合
      if (CommonService.isUser(vm.rest.user.roles) && $scope.isManager) {
        if (!_.contains(vm.rest.user.leaders, $scope.user._id.toString())) {
          $scope.handleShowToast('この休暇をみる権限がありません。', true);
          return handlePreviousScreen();
        }
      }
      // 本人はマネジャーで現在のユーザーは経理じゃない場合
      if (CommonService.isManager(vm.rest.user.roles) && ($scope.isManager || $scope.isUser)) {
        $scope.handleShowToast('この休暇をみる権限がありません。', true);
        return handlePreviousScreen();
      }
      // 本人は経理で現在のユーザーは経理じゃない場合
      if (CommonService.isAccountant(vm.rest.user.roles) && !($scope.isAccountant || $scope.isAdmin)) {
        $scope.handleShowToast('この休暇をみる権限がありません。', true);
        return handlePreviousScreen();
      }
    }

    // Remove existing Rest
    // function remove() {
    //   if ($window.confirm('Are you sure you want to delete?')) {
    //     vm.rest.$remove($state.go('rests.list'));
    //   }
    // }

    // Save Rest
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.restForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.rest._id) {
        vm.rest.$update(successCallback, errorCallback);
      } else {
        vm.rest.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('rests.view', {
          restId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
    // Trở về màn hình trước
    function handlePreviousScreen() {
      $state.go($state.previous.state.name || 'home', $state.previous.params);
    }
  }
}());
