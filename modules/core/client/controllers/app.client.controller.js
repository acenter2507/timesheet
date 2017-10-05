'use strict';

angular.module('core').controller('AppController', AppController);

AppController.$inject = ['$scope', 'Authentication', 'toastr', 'ngDialog'];

function AppController($scope, Authentication, toastr, ngDialog) {
  $scope.Authentication = Authentication;

  prepareScopeListener();
  function prepareScopeListener() {
    // Watch user info
    $scope.$watch('Authentication.user', () => {
      onCreate();
    });
    // Listen webapp state change
    $scope.$on('$stateChangeSuccess', function () {
      if (angular.element('body').hasClass('aside-menu-show')) {
        angular.element('body').removeClass('aside-menu-show');
      }
    });
  }
  function onCreate() {
    $scope.user = Authentication.user;
    $scope.isLogged = ($scope.user);
    $scope.isUser = $scope.isLogged && $scope.user.roles.length === 1;
    $scope.isAdmin = $scope.isLogged && _.contains($scope.user.roles, 'admin');
    $scope.isManager = $scope.isLogged && _.contains($scope.user.roles, 'manager');
    $scope.isAccountant = $scope.isLogged && _.contains($scope.user.roles, 'accountant');
    $scope.isLeader = $scope.isAdmin || $scope.isManager || $scope.isAccountant;
  }

  /**
   * HANDLES
   */
  // Hiển thị thông báo bình thường
  $scope.handleShowToast = function (msg, error) {
    if (error)
      return toastr.error(msg, 'Error');
    return toastr.success(msg, 'Done');
  };
  // Hiển thị confirm xác nhận
  $scope.handleShowConfirm = function (content, resolve, reject) {
    $scope.dialog = content;
    ngDialog.openConfirm({
      templateUrl: 'confirmTemplate.html',
      scope: $scope
    }).then(res => {
      delete $scope.dialog;
      if (resolve) {
        resolve(res);
      }
    }, res => {
      delete $scope.dialog;
      if (reject) {
        reject(res);
      }
    });
  };
}