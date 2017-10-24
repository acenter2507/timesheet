(function () {
  'use strict';

  angular
    .module('rests')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    // menuService.addMenuItem('topbar', {
    //   title: 'Rests',
    //   state: 'rests',
    //   type: 'dropdown',
    //   roles: ['*']
    // });

    // // Add the dropdown list item
    // menuService.addSubMenuItem('topbar', 'rests', {
    //   title: 'List Rests',
    //   state: 'rests.list'
    // });

    // // Add the dropdown create item
    // menuService.addSubMenuItem('topbar', 'rests', {
    //   title: 'Create Rest',
    //   state: 'rests.create',
    //   roles: ['user']
    // });
  }
}());
