'use strict';

// PasswordValidator service used for testing the password strength
angular.module('users').factory('PasswordValidator', ['$window',
  function ($window) {
    return {
      getResult: function (password) {
        var result = { errors: [] };
        var check = 0;
        if (password.length < 8) {
          result.errors.push('8 digit');
        }
        if (password.length > 32) {
          result.errors.push('32 digit');
        }
        return result;
      }
    };
  }
]);
