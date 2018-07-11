(function () {
  'use strict';

  angular
    .module('payments.admin')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    menuService.addSubMenuItem('topbar', 'admin', {
      title: '費用清算確認',
      state: 'admin.payments.reviews'
    });
  }
}());
