'use strict';

// Configuring the Articles module
angular.module('users.admin').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Manage Users',
      state: 'users',
      type: 'dropdown',
      roles: ['admin', 'manager', 'accountant']
    });

    Menus.addSubMenuItem('topbar', 'users', {
      title: 'List Users',
      state: 'users.list'
    });
  }
]);
