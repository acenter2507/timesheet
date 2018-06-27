(function () {
  'use strict';

  angular
    .module('chats')
    .controller('ChatsListController', ChatsListController);

  ChatsListController.$inject = ['ChatsService'];

  function ChatsListController(ChatsService) {
    var vm = this;

    vm.chats = ChatsService.query();
  }
}());
