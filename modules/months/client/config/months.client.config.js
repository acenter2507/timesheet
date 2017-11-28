(function () {
  'use strict';

  angular
    .module('months')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: '勤務表',
      state: 'months.list',
      roles: ['user']
    });
  }
}());
