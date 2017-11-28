(function () {
  'use strict';

  angular
    .module('months')
    .filter('MonthStatusFilter', MonthStatusFilter);

  function MonthStatusFilter() {
    return function (status) {
      switch (status) {
        case 1:
          return '未申請';
        case 2:
          return '確認中';
        case 3:
          return '承認';
        case 4:
          return '拒否';
        default:
          return '不明';
      }
    };
  }
}());
