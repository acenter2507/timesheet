(function () {
  'use strict';

  angular
    .module('departments.admin')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    Menus.addSubMenuItem('topbar', 'manager', {
      title: '部署管理',
      state: 'manager.departments.list'
    });
  }
}());
