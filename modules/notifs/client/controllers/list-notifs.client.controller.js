(function () {
  'use strict';

  angular
    .module('notifs')
    .controller('NotifsListController', NotifsListController);

  NotifsListController.$inject = ['NotifsService', 'Notifications', '$state', '$scope'];

  function NotifsListController(NotifsService, Notifications, $state, $scope) {
    var vm = this;

    onCreate();
    function onCreate() {
      prepareNotifications();
    }
    function prepareNotifications() {
      NotifsService.query().$promise.then(function (notifs) {
        vm.notifs = notifs;
      });
    }

    vm.handleClearAllNotifications = function () {
      $scope.handleShowConfirm({
        message: '全ての通知を削除しますか？'
      }, function () {
        Notifications.clear().then(function () {
          vm.notifs = [];
        });
      });
    };
    vm.handleViewNotif = function (notif) {
      $state.go(notif.state, { notif: notif._id });
    };
    vm.handleRemoveNotif = function (notif) {
      Notifications.remove(notif._id);
      vm.notifs = _.without(vm.notifs, notif);
    };
  }
}());
