(function () {
  'use strict';

  angular
    .module('users')
    .factory('UserRolesService', UserRolesService);

  function UserRolesService() {
    this.roles = [
      { name: '管理者', value: 'admin' },
      { name: '11111', value: '22222' },
      { name: 'マネージャ', value: 'manager' },
      { name: '経理', value: 'accountant' },
      { name: '経理2', value: 'accountant1' },
      { name: '一般社員', value: 'user' },
      { name: '確認者', value: 'reviewer' },
      { name: '参照者', value: 'viewer' }
    ];
    this.getRole = function(value) {
      var role = _.findWhere(this.roles, { value: value });
      return role;
    };
    return this;
  }
}());
