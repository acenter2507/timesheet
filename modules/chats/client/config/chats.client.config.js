(function () {
  'use strict';

  angular
    .module('chats')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'チャット',
      state: 'chats.list',
      roles: ['user']
    });
  }
}());
