'use strict';

angular.module('core').controller('AppController', AppController);

AppController.$inject = ['$scope', '$state', '$stateParams', 'Authentication', 'toastr', 'ngDialog', '$timeout', 'Notifications', 'Socket', 'Messages'];

function AppController($scope, $state, $stateParams, Authentication, toastr, ngDialog, $timeout, Notifications, Socket, Messages) {
  $scope.Authentication = Authentication;
  $scope.Notifications = Notifications;
  $scope.Messages = Messages;
  $scope.currentTime = new moment();

  prepareScopeListener();
  prepareDeviceChecking();
  prepareCurrentTime();

  function prepareScopeListener() {
    // Watch user info
    $scope.$watch('Authentication.user', function () {
      onCreate();
    });
    // Listen webapp state change
    $scope.$on('$stateChangeSuccess', function () {
      if (angular.element('body').hasClass('aside-menu-show')) {
        angular.element('body').removeClass('aside-menu-show');
      }
    });
    $scope.$on('$destroy', function () {
      $timeout.cancel($scope.currentTimer);
      Socket.removeListener('notifications');
      Socket.removeListener('messages');
    });
  }
  // Init socket
  function prepareSocketListener() {
    if (!Socket.socket) {
      Socket.connect();
    }
    // ソケット初期化
    Socket.emit('init', { user: $scope.Authentication.user._id });
    // サーバーからお知らせが来る
    Socket.on('notifications', function () {
      Notifications.count();
      // お知らせ一覧ページの場合は再ロード
      if ($state.current.name === 'notifs.list') {
        $state.transitionTo($state.current, $stateParams, {
          reload: true,
          inherit: false,
          notify: true
        });
      }
    });
    // サーバーからメッセージが来る
    Socket.on('messages', function () {
      Messages.count();
      // メッセージ一覧ページの場合は再ロード
      if ($state.current.name === 'messages.list') {
        $state.transitionTo($state.current, $stateParams, {
          reload: true,
          inherit: false,
          notify: true
        });
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

    // Socket
    if ($scope.isLogged) {
      prepareSocketListener();
      Notifications.count();
      Messages.count();
    }
  }
  function prepareDeviceChecking() {
    var parser = new UAParser();
    var result = parser.getResult();
    $scope.isMobile = result.device && (result.device.type === 'tablet' || result.device.type === 'mobile');
  }
  function prepareCurrentTime() {
    $scope.currentTime = new moment();
    $scope.currentTimer = $timeout(prepareCurrentTime, 60000);
  }
  /**
   * HANDLES
   */
  // Hiển thị thông báo bình thường
  $scope.handleShowToast = function (msg, error) {
    if (error)
      return toastr.error(msg, 'エラー');
    return toastr.success(msg, '完了');
  };
  // Hiển thị confirm xác nhận
  $scope.handleShowConfirm = function (content, resolve, reject) {
    $scope.dialog = content;
    ngDialog.openConfirm({
      templateUrl: 'confirmTemplate.html',
      scope: $scope
    }).then(function (res) {
      delete $scope.dialog;
      if (resolve) {
        resolve(res);
      }
    }, function (res) {
      delete $scope.dialog;
      if (reject) {
        reject(res);
      }
    });
  };
  // Hiển thị Dashboard
  $scope.handleShowDashboardMenu = function () {
    var mDialog = ngDialog.open({
      template: 'modules/core/client/views/templates/dashboard.dialog.template.html',
      scope: $scope
    });
  };
}