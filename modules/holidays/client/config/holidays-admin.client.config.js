(function () {
  'use strict';

  angular
    .module('holidays.admin')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'admin', {
      title: '休日形態管理',
      state: 'admin.holidays.list',
      roles: ['admin', 'accountant']
    });
  }
}());
