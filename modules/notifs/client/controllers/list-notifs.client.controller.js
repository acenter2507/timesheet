(function () {
  'use strict';

  angular
    .module('notifs')
    .controller('NotifsListController', NotifsListController);

  NotifsListController.$inject = ['NotifsService', 'Notifications', '$state', '$scope'];

  function NotifsListController(NotifsService, Notifications, $state, $scope) {
    var vm = this;

    vm.notifs = NotifsService.query();

    vm.handleClearAllNotifications = function () {
      $scope.handleShowConfirm({
        message: '全ての通知を削除しますか？'
      }, function () {
        Notifications.clear().then(function () {
          vm.notifs = [];
        });
      });
    };
    vm.handleViewDetailNotification = function (notif) {
      $state.go(notif.state, { notif: notif._id });
    };
  }
}());
