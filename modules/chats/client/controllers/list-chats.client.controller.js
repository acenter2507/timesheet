(function () {
  'use strict';

  angular
    .module('chats')
    .controller('ChatsListController', ChatsListController);

  ChatsListController.$inject = ['$scope', 'Socket', 'ChatsService', 'RoomsService', 'RoomsApi', 'ChatsApi', 'CommonService'];

  function ChatsListController($scope, Socket, ChatsService, RoomsService, RoomsApi, ChatsApi, CommonService) {
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
    vm.activeTab = 1;

    vm.room = {};
    vm.message = '';
    vm.messages = [];
    vm.messagePaginate = {
      page: 1,
      busy: false,
      stopped: false,
      limit: 30
    };

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
              handlePrepareForShowRoom(_rooms[0]);
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
      ChatsApi.users(vm.userPaginate)
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
    function handleLoadMessages() {
      if (vm.messagePaginate.busy || vm.messagePaginate.stopped) return;
      vm.messagePaginate.busy = true;
      ChatsApi.load(vm.room._id, vm.messagePaginate)
        .success(function (messages) {
          if (!messages || messages.length === 0) {
            vm.messagePaginate.stopped = true;
            vm.messagePaginate.busy = false;
          } else {
            for (var index = 0; index < messages.length; index++) {
              handlePrepareForShowMessage(messages[index]);
            }
            vm.messages = _.union(vm.messages, messages);
            vm.messagePaginate.page += 1;
            vm.messagePaginate.busy = false;
            if (messages.length < vm.messagePaginate.limit) vm.messagePaginate.stopped = true;
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

    vm.handleScrollLefiside = function () {
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
          handlePrepareForShowRoom(room);
          handleStartChatRoom(room);
        })
        .error(function (err) {
          return $scope.handleShowToast(err.message, true);
        });
    };

    function handleStartChatRoom(room) {
      RoomsService.get({ roomId: room._id }).$promise.then(function (room) {
        handlePrepareForShowRoom(room);
        vm.room = room;
        vm.messages = [];
        vm.messagePaginate = {
          page: 1,
          busy: false,
          stopped: false,
          limit: 30
        };
        handleLoadMessages();
      });
    }

    function handlePrepareForShowRoom(room) {
      if (room.kind === 1) {
        for (var index = 0; index < room.users.length; index++) {
          var user = room.users[index];
          if (user._id !== $scope.user._id) {
            room.name = user.displayName;
            room.avatar = user.profileImageURL;
          }
        }
      }
      return room;
    }
    function handlePrepareForShowMessage(message) {
      if (message.user._id === $scope.user._id) {
        message.self = true;
      } else {
        message.self = false;
      }
    }

    vm.handleSendMessage = function() {
      if (!vm.room || !vm.room._id || CommonService.isStringEmpty(vm.message)) {
        return;
      }
      // TODO
      // Chỉ đang code cho trường hợp tạo mới message
      var message = new ChatsService({
        content: vm.message,
        user: $scope.user._id,
        room: vm.room._id
      });
      message.$save(successCallback, errorCallback);
      function successCallback(message) {
        handlePrepareForShowMessage(message);
        vm.messages.push(message);
        // Trường hợp room chưa được tạo trước đó
        vm.room.updated = new Date();
        if (vm.room.started === 1) {
          vm.room.started = 2;
          vm.rooms.push(vm.room);
        }
        vm.room.$update();
      }
      function errorCallback(err) {
        $scope.handleShowToast(err.message);
      }      
    };
  }
}());
