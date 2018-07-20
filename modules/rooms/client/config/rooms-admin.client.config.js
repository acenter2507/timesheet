(function () {
  'use strict';

  angular
    .module('rooms.admin')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    menuService.addSubMenuItem('topbar', 'admin', {
      title: '会議室管理',
      state: 'admin.rooms.list',
      roles: ['admin', 'accountant']
    });
  }
}());
