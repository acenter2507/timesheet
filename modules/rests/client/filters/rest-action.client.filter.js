(function () {
  'use strict';

  angular
    .module('rests')
    .filter('RestActionFilter', RestActionFilter);

  function RestActionFilter() {
    return function (status) {
      switch (status) {
        case 1:
          return '作成';
        case 2:
          return '編集';
        case 3:
          return '送信';
        case 4:
          return '承認';
        case 5:
          return '拒否';
        case 6:
          return '使用';
        default:
          return '不明';
      }
    };
  }
}());
