(function () {
  'use strict';

  angular
    .module('payments')
    .filter('TransportMethod', TransportMethod)
    .filter('TripMethod', TripMethod)
    .filter('OtherKind', OtherKind)
    .filter('MeetingAccount', MeetingAccount)
    .filter('MeetingKind', MeetingKind);

  function TransportMethod() {
    return function (value) {
      switch (value) {
        case 0: return '自筆記入';
        case 1: return 'JR';
        case 2: return '私鉄';
        case 3: return '地下鉄';
        case 4: return 'バス';
        case 5: return 'TAXI';
        case 6: return '駐車代';
      }
    };
  }
  function TripMethod() {
    return function (value) {
      switch (value) {
        case 0: return '自筆記入';
        case 1: return '日当';
        case 2: return '特急券';
        case 3: return '指定券';
      }
    };
  }
  function OtherKind() {
    return function (value) {
      switch (value) {
        case 1: return '通信費';
        case 2: return '発送配達費';
        case 3: return '備品消耗品費';
        case 4: return '図書研究費';
        case 5: return '事務用品費';
        case 6: return 'その他';
        case 7: return 'その他①';
        case 8: return 'その他②';
      }
    };
  }
  function MeetingAccount() {
    return function (value) {
      switch (value) {
        case 0: return '自筆記入';
        case 1: return '会議費';
        case 2: return '接待交際費';
        case 3: return '厚生費';
      }
    };
  }
  function MeetingKind() {
    return function (value) {
      switch (value) {
        case 0: return '自筆記入';
        case 1: return 'GIFT';
        case 2: return '非課税';
      }
    };
  }
}());
