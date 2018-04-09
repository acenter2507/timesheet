(function () {
  'use strict';

  angular
    .module('workrests')
    .filter('RestStatusFilter', RestStatusFilter);

  function RestStatusFilter() {
    return function (status) {
      switch (status) {
        case 1:
          return '未申請';
        case 2:
          return '申請中';
        case 3:
          return '承認';
        case 4:
          return '拒否';
        case 5:
          return '取り消し申請中';
        default:
          return '不明';
      }
    };
  }
}());
