'use strict';

angular.module('core').controller('AppController', AppController);

AppController.$inject = ['$scope', 'Authentication', 'toastr', '$modal'];

function AppController($scope, Authentication, toastr, $modal) {
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
  $scope.handleShowConfirm = function (content, cb) {
    $scope.modal = content;
    $scope.modal.close = handleCloseConfig;
    $scope.modal.callback = handleCallback;
    var modalInstance = $modal.open({
      templateUrl: 'confirmTemplate.html',
      scope: $scope
    });

    function handleCloseConfig() {
      console.log('closed');
    }
    function handleCallback() {
      console.log('callback');
    }
  };
}