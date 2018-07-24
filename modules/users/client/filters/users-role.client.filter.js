(function () {
  'use strict';

  angular
    .module('users.admin')
    .filter('RoleFilter', RoleFilter);

  RoleFilter.$inject = [];

  function RoleFilter() {
    return function (role) {
      if (role === 'admin') {
        return 'システム管理';
      } else if (role === 'accountant') {
        return '経理部';
      } else if (role === 'manager') {
        return 'マネージャー';
      } else if (role === 'user') {
        return '一般社員';
      } else if (role === 'reviewer') {
        return '確認者';
      } else if (role === 'viewer') {
        return '参照者';
      }
    };
  }
}());
