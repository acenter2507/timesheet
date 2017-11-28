(function () {
  'use strict';

  angular
    .module('months')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Months',
      state: 'months',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'months', {
      title: 'List Months',
      state: 'months.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'months', {
      title: 'Create Month',
      state: 'months.create',
      roles: ['user']
    });
  }
}());
