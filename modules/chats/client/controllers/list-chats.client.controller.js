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
      limit: 15,
      busy: false,
      stopped: false
    };
    vm.rooms = [];
    vm.roomPaginate = {
      page: 1,
      limit: 15,
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
    vm.socketKeys = {
      chat: 'chat'
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
      Socket.on(vm.socketKeys.chat, handleReceivedChat);
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
    vm.handleLoadRooms = handleLoadRooms;
    function handleLoadRooms() {
      if (vm.roomPaginate.busy || vm.roomPaginate.stopped) return;
      vm.roomPaginate.busy = true;
      RoomsApi.load({ user: $scope.user._id, paginate: vm.roomPaginate })
        .success(function (_rooms) {
          if (!_rooms || _rooms.length === 0) {
            vm.roomPaginate.stopped = true;
          } else {
            for (var index = 0; index < _rooms.length; index++) {
              handlePrepareForShowRoom(_rooms[index]);
            }
            vm.rooms = _.union(vm.rooms, _rooms);
            vm.roomPaginate.page += 1;
            if (_rooms.length < vm.roomPaginate.limit) vm.roomPaginate.stopped = true;
          }
          // Trường hợp không có room nào
          if (vm.roomPaginate.stopped === true && vm.rooms.length === 0) {
            RoomsApi.myRoom()
              .success(function (room) {
                handleStartChatRoom(room, true);
              }).error(function (err) {
                $scope.handleShowToast(err.message, true);
              });
          }
          // Trường hợp chưa có room nào đang active
          if ((!vm.room || !vm.room._id) && vm.rooms.length > 0) {
            handleStartChatRoom(vm.rooms[0], false);
          }
          vm.roomPaginate.busy = false;
          if (!$scope.$$phase) $scope.$digest();
        })
        .error(function (err) {
          vm.roomPaginate.busy = false;
          return $scope.handleShowToast(err.message, true);
        });
    }
    vm.handleLoadUsers = handleLoadUsers;
    function handleLoadUsers() {
      console.log('handleLoadUsers 1');
      if (vm.userPaginate.busy || vm.userPaginate.stopped) return;
      console.log('handleLoadUsers 2');
      vm.userPaginate.busy = true;
      ChatsApi.users(vm.userPaginate)
        .success(function (_users) {
          console.log('handleLoadUsers 3');
          if (!_users || _users.length === 0) {
            vm.userPaginate.stopped = true;
          } else {
            vm.users = _.union(vm.users, _users);
            vm.userPaginate.page += 1;
            if (_users.length < vm.userPaginate.limit) vm.userPaginate.stopped = true;
          }
          vm.userPaginate.busy = false;
          if (!$scope.$$phase) $scope.$digest();
        })
        .error(function (err) {
          vm.userPaginate.busy = false;
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
      if (res.user.toString() === $scope.user._id.toString()) return;
      if (res.room.toString() !== vm.room._id.toString()) return;
      ChatsService.get({ chatId: res.chat }).$promise.then(function (message) {
        handlePrepareForShowMessage(message);
        vm.messages.push(message);
        vm.room.updated = new Date();
        vm.room.$update();
      });
    }
    function handleReceivedRooms(res) {
    }
    function handleReceivedUserss(res) {
    }

    vm.handleTabChanged = function (tab) {
      vm.activeTab = tab;
    };
    vm.handleUserSelected = function (user) {
      // Nếu chọn chính mình thì gọi room Mychat
      if (user._id === $scope.user._id) {
        return RoomsApi.myRoom().success(successCallback).error(errorCallback);
      } else {
        return RoomsApi.privateRoom(user._id).success(successCallback).error(errorCallback);
      }
      function successCallback(room) {
        handleStartChatRoom(room, false);
      }
      function errorCallback(err) {
        return $scope.handleShowToast(err.message, true);
      }
    };
    vm.handleRoomSelected = function (room) {
      if (!room._id) return;
      if (room._id === vm.room._id) return;
      handleStartChatRoom(room, false);
    };

    function handleStartChatRoom(room, isAdd) {
      RoomsService.get({ roomId: room._id }).$promise.then(function (room) {
        handlePrepareForShowRoom(room);
        vm.room = room;
        if (isAdd) {
          vm.rooms.push(room);
        }
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
      } else if (room.kind === 3) {
        room.name = 'マイチャット';
        room.avatar = room.user.profileImageURL;
      }
    }
    function handlePrepareForShowMessage(message) {
      if (message.user._id === $scope.user._id) {
        message.self = true;
      } else {
        message.self = false;
      }
    }

    vm.handleSendMessage = function () {
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
        // Xử lý trước khi show tin nhắn
        handlePrepareForShowMessage(message);
        // Thêm tin nhắn vào màn hình
        vm.messages.push(message);
        // Nếu không phải là My Chat thì gửi Socket
        if (vm.room.kind !== 3) {
          Socket.emit(vm.socketKeys.chat, {
            room: vm.room._id,
            time: new Date().getTime(),
            chat: message._id,
            user: $scope.user._id
          });
        }
        vm.room.updated = new Date();
        // Trường hợp room chưa được tạo trước đó
        if (vm.room.started === 1) {
          vm.room.started = 2;
          vm.rooms.push(vm.room);
        }
        vm.room.$update();
        vm.message = '';
      }
      function errorCallback(err) {
        $scope.handleShowToast(err.message);
      }
    };
  }
}());
