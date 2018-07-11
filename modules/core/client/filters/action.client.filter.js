(function () {
  'use strict';

  angular
    .module('core')
    .filter('ActionFilter', ActionFilter);

  function ActionFilter() {
    return function (action) {
      switch (action) {
        case 1:
          return '作成';
        case 2:
          return '編集';
        case 3:
          return '申請';
        case 4:
          return '承認';
        case 5:
          return '拒否';
        case 6:
          return '申請キャンセル';
        case 7:
          return '取り消し申請';
        default:
          return '不明';
      }
    };
  }
}());
