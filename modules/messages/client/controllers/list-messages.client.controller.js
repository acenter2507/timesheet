(function () {
  'use strict';

  angular
    .module('messages')
    .controller('MessagesListController', MessagesListController);

  MessagesListController.$inject = ['$scope', 'Messages'];

  function MessagesListController($scope, Messages) {
    var vm = this;

    // Infinity scroll
    vm.messages = [];
    vm.page = 1;
    vm.busy = false;
    vm.stopped = false;
    vm.new = false;

    onCreate();
    function onCreate() {
      prepareScopeListener();
      handleLoadMessages();
    }
    function prepareScopeListener() {
      $scope.$on('messages', function (event, args) {
        vm.new = true;
        if (!$scope.$$phase) $scope.$digest();
      });
    }
    vm.handleReloadMessages = function () {
      $scope.handleReloadState();
    };
    vm.handleClearAllMessages = function () {
      $scope.handleShowConfirm({
        message: '全てのメッセージを削除しますか？'
      }, function () {
        Messages.clear();
        vm.messages = [];
        vm.stopped = true;
        vm.page = 1;
        if (!$scope.$$phase) $scope.$digest();
      });
    };
    vm.handleRemoveMessage = function (message) {
      $scope.handleShowConfirm({
        message: 'メッセージを削除しますか？'
      }, function () {
        Messages.remove(message._id);
        vm.messages = _.without(vm.messages, message);
        if (!$scope.$$phase) $scope.$digest();
      });
    };
  }
}());
