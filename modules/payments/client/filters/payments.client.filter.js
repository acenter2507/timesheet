(function () {
  'use strict';

  angular
    .module('payments')
    .filter('TransportMethod', TransportMethod);

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
}());
