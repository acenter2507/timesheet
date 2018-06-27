(function () {
  'use strict';

  angular
    .module('chats')
    .controller('ChatsListController', ChatsListController);

  ChatsListController.$inject = ['$scope', 'Socket', 'ChatsService', 'RoomsService'];

  function ChatsListController($scope, Socket, ChatsService, RoomsService) {
    var vm = this;

    vm.onlines = [];
    vm.onlinePaginate = {
      page: 1,
      limit: 50,
      busy: false,
      stopped: false
    };
    vm.rooms = [];
    vm.roomPaginate = {
      page: 1,
      limit: 50,
      busy: false,
      stopped: false
    };
    vm.room = {};
    vm.activeTab = 1;

    onCreate();
    function onCreate() {
      prepareSocketListenner();
      handleLoadRooms();
      handleLoadOnlines();
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
    function handleLoadRooms() {
      Socket.emit('rooms', { user: $scope.user._id, paginate: vm.roomPaginate });
    }
    function handleLoadOnlines() {
      Socket.emit('onlines', { user: $scope.user._id, paginate: vm.onlinePaginate });
    }

    function handleReceivedChat(res) {
      if (res.error) return $scope.handleShowToast(res.message, true);
      console.log(res);
    }
    function handleReceivedRooms(res) {
      if (res.error) return $scope.handleShowToast(res.message, true);
      if (!res.rooms || res.rooms.length === 0) {
        vm.roomPaginate.stopped = true;
        vm.roomPaginate.busy = false;
      } else {
        vm.rooms = _.union(vm.rooms, res.rooms);
        vm.roomPaginate.page += 1;
        vm.roomPaginate.busy = false;
        if (res.rooms.length < vm.roomPaginate.limit) vm.roomPaginate.stopped = true;
      }
      if (!$scope.$$phase) $scope.$digest();
    }
    function handleReceivedOnlines(res) {
      if (res.error) return $scope.handleShowToast(res.message, true);
      if (!res.onlines || res.onlines.length === 0) {
        vm.onlinePaginate.stopped = true;
        vm.onlinePaginate.busy = false;
      } else {
        vm.onlines = _.union(vm.onlines, res.onlines);
        vm.onlinePaginate.page += 1;
        vm.onlinePaginate.busy = false;
        if (res.onlines.length < vm.onlinePaginate.limit) vm.onlinePaginate.stopped = true;
      }
      if (!$scope.$$phase) $scope.$digest();
    }
    vm.handleLoadDatas = function () {
      switch (vm.activeTab) {
        case 1:
          return handleLoadRooms();
        case 2:
          return handleLoadOnlines();
        case 3:
          return;
      }
    };
    vm.handleTabChanged = function (tab) {
      vm.activeTab = tab;
    };
    vm.handleUserSelected = function (user) {
      // Kiểm tra đã có tin nhắn private với user đã chọn chưa
      var users = [user._id, $scope.user._id];
      var room = _.findWhere(vm.rooms, { kind: 1, users: users });

      if (!room) {
        Socket.on('verify_private_room', function (res) {
          Socket.removeListener('verify_private_room');
          if (!res.room) {
            var newRoom = new RoomsService({
              users: users,
              kind: 1,
              user: $scope.user._id
            });
            newRoom.$save(function (res) {
              console.log(res);
            });
          } else {
            handleStartChatRoom(res.room);
          }
        });
        Socket.emit('verify_private_room', { users: users });
      } else {
        handleStartChatRoom(room);
      }

      function handleStartChatRoom(room) {
        console.log(room);
      }
    };
  }
}());
