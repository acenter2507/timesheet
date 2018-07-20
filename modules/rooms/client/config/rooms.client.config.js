(function () {
  'use strict';

  angular
    .module('rooms')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    // Set top bar menu items
    // menuService.addMenuItem('topbar', {
    //   title: 'Rooms',
    //   state: 'rooms',
    //   type: 'dropdown',
    //   roles: ['*']
    // });

    // // Add the dropdown list item
    // menuService.addSubMenuItem('topbar', 'rooms', {
    //   title: 'List Rooms',
    //   state: 'rooms.list'
    // });

    // // Add the dropdown create item
    // menuService.addSubMenuItem('topbar', 'rooms', {
    //   title: 'Create Room',
    //   state: 'rooms.create',
    //   roles: ['user']
    // });
  }
}());
