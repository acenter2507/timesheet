'use strict';

angular.module('core.admin').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: '管理者',
      state: 'admin',
      type: 'dropdown',
      roles: ['admin', 'accountant']
    });
  }
]);
