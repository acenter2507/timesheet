(function () {
  'use strict';

  angular
    .module('holidays')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Holidays',
      state: 'holidays',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'holidays', {
      title: 'List Holidays',
      state: 'holidays.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'holidays', {
      title: 'Create Holiday',
      state: 'holidays.create',
      roles: ['user']
    });
  }
}());
