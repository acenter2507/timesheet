(function () {
  'use strict';

  angular
    .module('chats')
    .controller('ChatsListController', ChatsListController);

  ChatsListController.$inject = ['$scope', 'Socket', 'ChatsService', 'GroupsService', 'GroupsApi', 'ChatsApi', 'CommonService'];

  function ChatsListController($scope, Socket, ChatsService, GroupsService, GroupsApi, ChatsApi, CommonService) {
    var vm = this;

    vm.activeTab = 1;

    vm.group = {};
    vm.message = '';
    vm.socketKeys = {
      chat: 'chat'
    };

    onCreate();
    function onCreate() {
      prepareMessagesPaging();
      prepareGroupsPaging();
      prepareUsersPaging();
      prepareSocketListenner();
      handleLoadGroups();
      handleLoadUsers();
    }

    function prepareMessagesPaging() {
      vm.messages = [];
      vm.messagePaginate = {
        page: 1,
        busy: false,
        newest: true,
        stopped: false,
        limit: 10
      };
    }
    function prepareGroupsPaging() {
      vm.groups = [];
      vm.groupPaginate = {
        page: 1,
        limit: 15,
        busy: false,
        stopped: false
      };
    }
    function prepareUsersPaging() {
      vm.users = [];
      vm.userPaginate = {
        page: 1,
        limit: 15,
        busy: false,
        stopped: false
      };
    }
    function prepareSocketListenner() {
      if (!Socket.socket) {
        Socket.connect();
      }
      // Nhận tin nhắn đến
      Socket.on(vm.socketKeys.chat, handleReceivedChat);
      // // Nhận groups
      // Socket.on('groups', handleReceivedGroups);
      // // Nhận onlines
      // Socket.on('onlines', handleReceivedOnlines);

      $scope.$on('$destroy', function () {
        Socket.removeListener('chat');
        Socket.removeListener('groups');
        Socket.removeListener('onlines');
      });
    }
    vm.handleLoadGroups = handleLoadGroups;
    function handleLoadGroups() {
      if (vm.groupPaginate.busy || vm.groupPaginate.stopped) return;
      vm.groupPaginate.busy = true;
      GroupsApi.load({ user: $scope.user._id, paginate: vm.groupPaginate })
        .success(function (_groups) {
          if (!_groups || _groups.length === 0) {
            vm.groupPaginate.stopped = true;
          } else {
            for (var index = 0; index < _groups.length; index++) {
              handlePrepareForShowGroup(_groups[index]);
            }
            vm.groups = _.union(vm.groups, _groups);
            vm.groupPaginate.page += 1;
            if (_groups.length < vm.groupPaginate.limit) vm.groupPaginate.stopped = true;
          }
          // Trường hợp không có group nào
          if (vm.groupPaginate.stopped === true && vm.groups.length === 0) {
            GroupsApi.myGroup()
              .success(function (group) {
                handleStartChatGroup(group, true);
              }).error(function (err) {
                $scope.handleShowToast(err.message, true);
              });
          }
          // Trường hợp chưa có group nào đang active
          if ((!vm.group || !vm.group._id) && vm.groups.length > 0) {
            handleStartChatGroup(vm.groups[0], false);
          }
          vm.groupPaginate.busy = false;
          if (!$scope.$$phase) $scope.$digest();
        })
        .error(function (err) {
          vm.groupPaginate.busy = false;
          return $scope.handleShowToast(err.message, true);
        });
    }
    vm.handleLoadUsers = handleLoadUsers;
    function handleLoadUsers() {
      if (vm.userPaginate.busy || vm.userPaginate.stopped) return;
      vm.userPaginate.busy = true;
      ChatsApi.users(vm.userPaginate)
        .success(function (_users) {
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
    vm.handleLoadMessages = handleLoadMessages;
    function handleLoadMessages() {
      if (vm.messagePaginate.busy || vm.messagePaginate.stopped) return;
      vm.messagePaginate.busy = true;
      ChatsApi.load(vm.group._id, vm.messagePaginate)
        .success(function (messages) {
          if (!messages || messages.length === 0) {
            vm.messagePaginate.stopped = true;
          } else {
            for (var index = 0; index < messages.length; index++) {
              handlePrepareForShowMessage(messages[index]);
              vm.messages.unshift(messages[index]);
            }
            // vm.messages = _.union(vm.messages, messages);
            vm.messagePaginate.page += 1;
            if (messages.length < vm.messagePaginate.limit) vm.messagePaginate.stopped = true;
          }
          vm.messagePaginate.busy = false;
          if (!$scope.$$phase) $scope.$digest();
        })
        .error(function (err) {
          return $scope.handleShowToast(err.message, true);
        });
    }

    function handleReceivedChat(res) {
      console.log(res);
      if (res.error) return $scope.handleShowToast(res.message, true);
      if (res.user.toString() === $scope.user._id.toString()) return;
      if (res.group.toString() !== vm.group._id.toString()) return;
      ChatsService.get({ chatId: res.chat }).$promise.then(function (message) {
        handlePrepareForShowMessage(message);
        vm.messages.push(message);
        vm.group.updated = new Date();
        vm.group.$update();
      });
    }
    function handleReceivedGroups(res) {
    }
    function handleReceivedUserss(res) {
    }

    vm.handleTabChanged = function (tab) {
      vm.activeTab = tab;
    };
    vm.handleUserSelected = function (user) {
      // Nếu chọn chính mình thì gọi group Mychat
      if (user._id === $scope.user._id) {
        return GroupsApi.myGroup().success(successCallback).error(errorCallback);
      } else {
        return GroupsApi.privateGroup(user._id).success(successCallback).error(errorCallback);
      }
      function successCallback(group) {
        handleStartChatGroup(group, false);
      }
      function errorCallback(err) {
        return $scope.handleShowToast(err.message, true);
      }
    };
    vm.handleGroupSelected = function (group) {
      if (!group._id) return;
      if (group._id === vm.group._id) return;
      handleStartChatGroup(group, false);
    };

    function handleStartChatGroup(group, isAdd) {
      GroupsService.get({ groupId: group._id }).$promise.then(function (group) {
        handlePrepareForShowGroup(group);
        vm.group = group;
        if (isAdd) {
          vm.groups.push(group);
        }
        prepareMessagesPaging();
        handleLoadMessages();
      });
    }
    function handlePrepareForShowGroup(group) {
      if (group.kind === 1) {
        for (var index = 0; index < group.users.length; index++) {
          var user = group.users[index];
          if (user._id !== $scope.user._id) {
            group.name = user.displayName;
            group.avatar = user.profileImageURL;
          }
        }
      } else if (group.kind === 3) {
        group.name = 'マイチャット';
        group.avatar = group.user.profileImageURL;
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
      if (!vm.group || !vm.group._id || CommonService.isStringEmpty(vm.message)) {
        return;
      }
      // TODO
      // Chỉ đang code cho trường hợp tạo mới message
      var message = new ChatsService({
        content: vm.message,
        user: $scope.user._id,
        group: vm.group._id
      });
      message.$save(successCallback, errorCallback);
      function successCallback(message) {
        // Xử lý trước khi show tin nhắn
        handlePrepareForShowMessage(message);
        // Thêm tin nhắn vào màn hình
        vm.messages.push(message);
        // Nếu không phải là My Chat thì gửi Socket
        if (vm.group.kind !== 3) {
          Socket.emit(vm.socketKeys.chat, {
            group: vm.group._id,
            time: new Date().getTime(),
            chat: message._id,
            user: $scope.user._id
          });
        }
        vm.group.updated = new Date();
        // Trường hợp group chưa được tạo trước đó
        if (vm.group.started === 1) {
          vm.group.started = 2;
          vm.groups.push(vm.group);
        }
        vm.group.$update();
        vm.message = '';
      }
      function errorCallback(err) {
        $scope.handleShowToast(err.data.message, true);
      }
    };
    vm.handleScroll = function() {
      console.log('Called');
    };
  }
}());
