(function () {
  'use strict';

  angular
    .module('chats')
    .controller('ChatsListController', ChatsListController);

  ChatsListController.$inject = ['$scope', 'Socket', 'ChatsService', 'RoomsService', 'RoomsApi', 'ChatsApi'];

  function ChatsListController($scope, Socket, ChatsService, RoomsService, RoomsApi, ChatsApi) {
    var vm = this;

    vm.users = [];
    vm.userPaginate = {
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
      handleLoadUsers();
    }

    function prepareSocketListenner() {
      if (!Socket.socket) {
        Socket.connect();
      }
      // Nhận tin nhắn đến
      Socket.on('chat', handleReceivedChat);
      // // Nhận rooms
      // Socket.on('rooms', handleReceivedRooms);
      // // Nhận onlines
      // Socket.on('onlines', handleReceivedOnlines);

      $scope.$on('$destroy', function () {
        Socket.removeListener('chat');
        Socket.removeListener('rooms');
        Socket.removeListener('onlines');
      });
    }
    function handleLoadRooms() {
      if (vm.roomPaginate.busy || vm.roomPaginate.stopped) return;
      vm.roomPaginate.busy = true;
      RoomsApi.load({ user: $scope.user._id, paginate: vm.roomPaginate })
        .success(function (_rooms) {
          if (!_rooms || _rooms.length === 0) {
            vm.roomPaginate.stopped = true;
            vm.roomPaginate.busy = false;
          } else {
            for (var index = 0; index < _rooms.length; index++) {
              detectPrivateRoom(_rooms[0]);
            }
            vm.rooms = _.union(vm.rooms, _rooms);
            vm.roomPaginate.page += 1;
            vm.roomPaginate.busy = false;
            if (_rooms.length < vm.roomPaginate.limit) vm.roomPaginate.stopped = true;
          }
          if (!$scope.$$phase) $scope.$digest();
        })
        .error(function (err) {
          return $scope.handleShowToast(err.message, true);
        });
    }
    function handleLoadUsers() {
      // Socket.emit('onlines', { user: $scope.user._id, paginate: vm.onlinePaginate });
      if (vm.userPaginate.busy || vm.userPaginate.stopped) return;
      vm.userPaginate.busy = true;
      ChatsApi.load(vm.userPaginate)
        .success(function (_users) {
          if (!_users || _users.length === 0) {
            vm.userPaginate.stopped = true;
            vm.userPaginate.busy = false;
          } else {
            vm.users = _.union(vm.users, _users);
            vm.userPaginate.page += 1;
            vm.userPaginate.busy = false;
            if (_users.length < vm.userPaginate.limit) vm.userPaginate.stopped = true;
          }
          if (!$scope.$$phase) $scope.$digest();
        })
        .error(function (err) {
          return $scope.handleShowToast(err.message, true);
        });
    }

    function handleReceivedChat(res) {
      if (res.error) return $scope.handleShowToast(res.message, true);
      console.log(res);
    }
    function handleReceivedRooms(res) {
    }
    function handleReceivedUserss(res) {
    }
    vm.handleLoadDatas = function () {
      switch (vm.activeTab) {
        case 1:
          return handleLoadRooms();
        case 2:
          return;
        case 3:
          return;
      }
    };
    vm.handleTabChanged = function (tab) {
      vm.activeTab = tab;
    };
    vm.handleUserSelected = function (user) {
      // Kiểm tra đã có tin nhắn private với user đã chọn chưa
      RoomsApi.privateRoom(user._id)
        .success(function (room) {
          handleStartChatRoom(room);
        })
        .error(function (err) {
          return $scope.handleShowToast(err.message, true);
        });
    };

    function handleStartChatRoom(room) {
      vm.room = room;
      if (!$scope.$$phase) $scope.$digest();
    }

    function detectPrivateRoom(room) {
      if (room.kind === 1) {
        for (var index = 0; index < room.users.length; index++) {
          var user = room.users[index];
          if (user._id !== $scope.user._id) {
            room.name = user.displayName;
            room.avatar = user.profileImageURL;
          }
        }
      }
    }
  }
}());
