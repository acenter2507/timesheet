(function () {
  'use strict';

  angular
    .module('chats')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Chats',
      state: 'chats',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'chats', {
      title: 'List Chats',
      state: 'chats.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'chats', {
      title: 'Create Chat',
      state: 'chats.create',
      roles: ['user']
    });
  }
}());
