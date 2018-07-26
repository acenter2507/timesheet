(function () {
  'use strict';

  angular
    .module('users.admin')
    .filter('UserStatusFilter', UserStatusFilter);

  UserStatusFilter.$inject = [];

  function UserStatusFilter() {
    return function (status) {
      if (status === 1) {
        return '在職中';
      } else {
        return '退職済';
      }
    };
  }
}());
