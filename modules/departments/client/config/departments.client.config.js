(function () {
  'use strict';

  angular
    .module('departments')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Departments',
      state: 'departments.list'
    });
  }
}());
