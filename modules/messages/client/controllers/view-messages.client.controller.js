(function () {
  'use strict';

  // Messages controller
  angular
    .module('messages')
    .controller('ViewMessageController', ViewMessageController);

  ViewMessageController.$inject = ['$scope', 'Messages', 'messageResolve'];

  function ViewMessageController($scope, Messages, message) {
    var vm = this;
    vm.message = message;

    onCreate();
    function onCreate() {
      if (vm.message.status === 1) {
        Messages.open(vm.message._id);
      }
    }

  }
}());