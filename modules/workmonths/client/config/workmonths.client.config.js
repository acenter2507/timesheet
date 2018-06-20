(function () {
  'use strict';

  angular
    .module('workmonths')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: '勤務時間',
      state: 'workmonths',
      type: 'dropdown',
      roles: ['user']
    });
    menuService.addSubMenuItem('topbar', 'workmonths', {
      title: '勤務表管理',
      state: 'workmonths.list',
      roles: ['user']
    });
    menuService.addSubMenuItem('topbar', 'workmonths', {
      title: '勤務表確認',
      state: 'workmonths.reviews',
      roles: ['manager', 'admin', 'accountant']
    });
  }
}());
