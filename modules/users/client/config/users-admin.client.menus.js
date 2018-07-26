'use strict';

// Configuring the Articles module
angular.module('users.admin').run(['Menus',
  function (Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'アカウント管理',
      state: 'admin.users.list'
    });
    Menus.addSubMenuItem('topbar', 'accountant', {
      title: '社員管理',
      state: 'accountant.users.list'
    });
  }
]);
