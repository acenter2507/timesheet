(function () {
  'use strict';

  angular
    .module('workrests.admin')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'admin', {
      title: '休暇確認',
      state: 'admin.workrests.reviews',
      roles: ['manager', 'admin', 'accountant']
    });
  }
}());
