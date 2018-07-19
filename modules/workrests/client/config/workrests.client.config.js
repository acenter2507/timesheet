(function () {
  'use strict';

  angular
    .module('workrests')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    // Set top bar menu items
    // menuService.addMenuItem('topbar', {
    //   title: '休暇管理',
    //   state: 'workrests',
    //   type: 'dropdown',
    //   roles: ['user']
    // });

    // // Add the dropdown list item
    // menuService.addSubMenuItem('topbar', 'workrests', {
    //   title: '休暇一覧',
    //   state: 'workrests.list',
    //   roles: ['user']
    // });

    // // Add the dropdown create item
    // menuService.addSubMenuItem('topbar', 'workrests', {
    //   title: '休暇登録',
    //   state: 'workrests.create',
    //   roles: ['user']
    // });
  }
}());
