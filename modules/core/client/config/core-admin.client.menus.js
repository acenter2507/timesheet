'use strict';

angular.module('core.admin').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: '管理者',
      state: 'admin',
      type: 'dropdown',
      roles: ['admin']
    });
    Menus.addMenuItem('topbar', {
      title: '経理部',
      state: 'accountant',
      type: 'dropdown',
      roles: ['accountant']
    });
    Menus.addMenuItem('topbar', {
      title: 'マネージャー',
      state: 'manager',
      type: 'dropdown',
      roles: ['manager']
    });
    Menus.addMenuItem('topbar', {
      title: '確認者',
      state: 'reviewer',
      type: 'dropdown',
      roles: ['reviewer']
    });
  }
]);
