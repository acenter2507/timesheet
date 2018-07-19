(function () {
  'use strict';

  angular
    .module('workmonths.admin')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    menuService.addSubMenuItem('topbar', 'admin', {
      title: '勤務表確認',
      state: 'admin.workmonths.reviews',
      roles: ['admin', 'accountant']
    });
  }
}());
