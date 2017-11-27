(function () {
  'use strict';

  angular
    .module('notifications')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Notifications',
      state: 'notifications',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'notifications', {
      title: 'List Notifications',
      state: 'notifications.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'notifications', {
      title: 'Create Notification',
      state: 'notifications.create',
      roles: ['user']
    });
  }
}());
