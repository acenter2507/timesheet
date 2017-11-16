(function () {
  'use strict';

  angular
    .module('rests')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: '休暇',
      state: 'rests',
      type: 'dropdown',
      roles: ['user']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'rests', {
      title: '一覧',
      state: 'rests.list'
    });
    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'rests', {
      title: '登録',
      state: 'rests.create'
    });
    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'rests', {
      title: '確認',
      state: 'rests.review',
      roles: ['admin', 'manager', 'accountant']
    });
  }
}());
