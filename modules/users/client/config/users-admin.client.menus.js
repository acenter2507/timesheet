'use strict';

// Configuring the Articles module
angular.module('users.admin').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: '社員',
      state: 'users.list',
      // type: 'dropdown',
      roles: '*'
    });

    // Menus.addSubMenuItem('topbar', 'users', {
    //   title: 'List Users',
    //   state: 'users.list'
    // });
  }
]);
