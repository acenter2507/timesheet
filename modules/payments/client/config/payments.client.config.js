(function () {
  'use strict';

  angular
    .module('payments')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    // Set top bar menu items
    // menuService.addMenuItem('topbar', {
    //   title: '費用清算管理',
    //   state: 'payments',
    //   type: 'dropdown',
    //   roles: ['user']
    // });

    // // Add the dropdown list item
    // menuService.addSubMenuItem('topbar', 'payments', {
    //   title: '費用清算一覧',
    //   state: 'payments.list'
    // });
  }
}());
