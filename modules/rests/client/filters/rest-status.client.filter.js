(function () {
  'use strict';

  angular
    .module('rests')
    .filter('RestStatusFilter', RestStatusFilter);

  function RestStatusFilter() {
    return function (status) {
      switch (status) {
        case 1:
          return '未申請';
        case 2:
          return '期待中';
        case 3:
          return 'キャッセル済み';
        case 4:
          return '確認済';
        case 5:
          return '拒否';
        case 6:
          return '終了';
        default:
          return '不明';
      }
    };
  }
}());
