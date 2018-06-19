(function () {
  'use strict';

  angular
    .module('messages')
    .controller('MessagesListController', MessagesListController);

  MessagesListController.$inject = ['$state', '$scope', 'MessagesService', 'Messages'];

  function MessagesListController($state, $scope, MessagesService, Messages) {
    var vm = this;

    onCreate();
    function onCreate() {
      prepareMessages();
    }
    function prepareMessages() {
      MessagesService.query().$promise.then(function (messages) {
        vm.messages = messages;
      });
    }
    vm.handleClearAllMessages = function () {
      $scope.handleShowConfirm({
        message: '全ての通知を削除しますか？'
      }, function () {
        Messages.clear().then(function () {
          vm.messages = [];
        });
      });
    };
    vm.handleRemoveMessage = function (message) {
      Messages.remove(message._id);
      vm.messages = _.without(vm.messages, message);
    };
  }
}());
