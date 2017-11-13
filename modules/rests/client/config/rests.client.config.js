(function () {
  'use strict';

  angular
    .module('rests')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    Menus.addMenuItem('topbar', {
      title: '休暇登録',
      state: 'departments.list'
    });
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
