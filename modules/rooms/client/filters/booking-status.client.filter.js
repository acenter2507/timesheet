(function () {
  'use strict';

  angular
    .module('bookings')
    .filter('BookingStatusFilter', BookingStatusFilter);

  function BookingStatusFilter() {
    return function (status) {
      switch (status) {
        case 1:
          return '予約中';
        case 2:
          return 'キャンセル済み';
        case 3:
          return '利用済';
        case 4:
          return '拒否';
        default:
          return '不明';
      }
    };
  }
}());
