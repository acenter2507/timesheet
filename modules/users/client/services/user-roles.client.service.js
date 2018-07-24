(function () {
  'use strict';

  angular
    .module('users')
    .factory('UserRolesService', UserRolesService);

  function UserRolesService() {
    this.roles = [
      { name: '管理者', value: 'admin' },
      { name: 'マネージャ', value: 'manager' },
      { name: '一般社員', value: 'user' },
      { name: '確認者', value: 'reviewer' },
      { name: '参照者', value: 'viewer' },
      { name: '経理部', value: 'accountant' }
    ];
    this.getRole = function(value) {
      var role = _.findWhere(this.roles, { value: value });
      return role;
    };
    return this;
  }
}());
