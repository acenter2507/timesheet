(function () {
  'use strict';

  angular
    .module('notifs')
    .controller('NotifsListController', NotifsListController);

  NotifsListController.$inject = ['NotifsService', 'Notifications', '$state'];

  function NotifsListController(NotifsService, Notifications, $state) {
    var vm = this;

    vm.notifs = NotifsService.query();

    vm.handleClearAllNotifications = () => {
      $scope.handleShowConfirm({
        message: '全ての通知を削除しますか？'
      }, () => {
        Notifications.clear().success(() => {
          vm.notifs = [];
        });
      });
    };
    vm.handleViewDetailNotification = notif => {
      $state.go(notif.state, { notifId: notif._id });
    };
  }
}());
