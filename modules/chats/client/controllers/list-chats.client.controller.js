(function () {
  'use strict';

  angular
    .module('chats')
    .controller('ChatsListController', ChatsListController);

  ChatsListController.$inject = ['$scope', 'Socket', 'ChatsService'];

  function ChatsListController($scope, Socket, ChatsService) {
    var vm = this;

    vm.onlines = [];
    vm.rooms = [];
    vm.room = {};

    onCreate();
    function onCreate() {
      prepareSocketListenner();
      prepareRooms();
      prepareOnlines();
    }

    function prepareSocketListenner() {
      if (!Socket.socket) {
        Socket.connect();
      }
      // Nhận tin nhắn đến
      Socket.on('chat', handleReceivedChat);
      // Nhận rooms
      Socket.on('rooms', handleReceivedRooms);
      // Nhận onlines
      Socket.on('onlines', handleReceivedOnlines);

      $scope.$on('$destroy', function () {
        Socket.removeListener('chat');
        Socket.removeListener('rooms');
        Socket.removeListener('onlines');
      });
    }
    function prepareRooms() {
      Socket.emit('rooms', { user: $scope.user._id });
    }
    function prepareOnlines() {
      Socket.emit('onlines', { user: $scope.user._id });
    }

    function handleReceivedChat(res) {
      console.log(res);
    }
    function handleReceivedRooms(res) {
      console.log(res);
    }
    function handleReceivedOnlines(res) {
      console.log(res);
    }

    vm.handleChatSelected = function () {
      prepareRooms();
    };
    vm.handleOnlineSelected = function () {
      prepareOnlines();
    };

  }
}());
