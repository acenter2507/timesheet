(function () {
  'use strict';

  angular
    .module('messages')
    .controller('MessagesListController', MessagesListController);

  MessagesListController.$inject = ['$scope', 'MessagesService', 'Messages'];

  function MessagesListController($scope, MessagesService, Messages) {
    var vm = this;

    // Infinity scroll
    vm.messages = [];
    vm.page = 1;
    vm.busy = false;
    vm.stopped = false;

    onCreate();
    function onCreate() {
      prepareMessages();
    }
    function prepareMessages() {
      MessagesService.query().$promise.then(function (messages) {
        vm.messages = messages;
      });
    }
    vm.handleLoadMessages = handleLoadMessages;
    function handleLoadMessages() {
      if (vm.stopped || vm.busy) return;
      vm.busy = true;

      Action.loadComments(vm.poll._id, vm.page, vm.cmt_sort.val)
        .then(res => {
          if (!res.data.length || res.data.length === 0) {
            vm.stopped = true;
            vm.busy = false;
          } else {
            // Gán data vào danh sách comment hiện tại
            vm.cmts = _.union(vm.cmts, res.data);
            vm.page += 1;
            vm.busy = false;
            if (res.data.length < 10) vm.stopped = true;
          }
          if (!$scope.$$phase) $scope.$digest();
        })
        .catch(err => {
          $scope.handleShowMessage('MS_CM_LOAD_ERROR', true);
        });
    }

    vm.handleClearAllMessages = function () {
      $scope.handleShowConfirm({
        message: '全てのメッセージを削除しますか？'
      }, function () {
        Messages.clear();
        vm.messages = [];
        vm.page = 1;
        if (!$scope.$$phase) $scope.$digest();
      });
    };
    vm.handleRemoveMessage = function (message) {
      Messages.remove(message._id);
      vm.messages = _.without(vm.messages, message);
      if (!$scope.$$phase) $scope.$digest();
    };
  }
}());
