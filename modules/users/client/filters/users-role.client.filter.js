(function () {
  'use strict';

  angular
    .module('users.admin')
    .filter('RoleFilter', RoleFilter);

  RoleFilter.$inject = [];

  function RoleFilter() {
    return function (roles) {
      if (_.contains(roles, 'accountant') && _.contains(roles, 'manager')) return '経理マネージャ';
      if (_.contains(roles, 'admin')) return 'システム管理';
      if (_.contains(roles, 'accountant')) return '経理部';
      if (_.contains(roles, 'manager')) return 'マネージャ';
      return '一般社員';
    };
  }
}());
