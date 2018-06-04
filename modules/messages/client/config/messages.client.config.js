(function () {
  'use strict';

  angular
    .module('messages')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    // // Set top bar menu items
    // menuService.addMenuItem('topbar', {
    //   title: 'Messages',
    //   state: 'messages',
    //   type: 'dropdown',
    //   roles: ['*']
    // });

    // // Add the dropdown list item
    // menuService.addSubMenuItem('topbar', 'messages', {
    //   title: 'List Messages',
    //   state: 'messages.list'
    // });

    // // Add the dropdown create item
    // menuService.addSubMenuItem('topbar', 'messages', {
    //   title: 'Create Message',
    //   state: 'messages.create',
    //   roles: ['user']
    // });
  }
}());
