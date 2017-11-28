(function () {
  'use strict';

  angular
    .module('notifs')
    .controller('NotifsListController', NotifsListController);

  NotifsListController.$inject = ['NotifsService', 'Notifications', '$state', '$scope'];

  function NotifsListController(NotifsService, Notifications, $state, $scope) {
    var vm = this;

    vm.notifs = NotifsService.query();

    vm.handleClearAllNotifications = () => {
      $scope.handleShowConfirm({
        message: '全ての通知を削除しますか？'
      }, () => {
        Notifications.clear().then(() => {
          vm.notifs = [];
        });
      });
    };
    vm.handleViewDetailNotification = notif => {
      $state.go(notif.state, { notif: notif._id });
    };
  }
}());
