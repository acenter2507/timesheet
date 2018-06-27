(function () {
  'use strict';

  // Chats controller
  angular
    .module('chats')
    .controller('ChatsController', ChatsController);

  ChatsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'chatResolve'];

  function ChatsController ($scope, $state, $window, Authentication, chat) {
    var vm = this;

    vm.authentication = Authentication;
    vm.chat = chat;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Chat
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.chat.$remove($state.go('chats.list'));
      }
    }

    // Save Chat
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.chatForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.chat._id) {
        vm.chat.$update(successCallback, errorCallback);
      } else {
        vm.chat.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('chats.view', {
          chatId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
