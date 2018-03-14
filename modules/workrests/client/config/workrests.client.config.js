(function () {
  'use strict';

  angular
    .module('workrests')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Workrests',
      state: 'workrests',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'workrests', {
      title: 'List Workrests',
      state: 'workrests.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'workrests', {
      title: 'Create Workrest',
      state: 'workrests.create',
      roles: ['user']
    });
  }
}());
