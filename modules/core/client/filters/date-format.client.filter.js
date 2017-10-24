(function () {
  'use strict';

  angular
    .module('core')
    .filter('LLLL', LLLL_format);

  function LLLL_format() {
    return function (time) {
      return moment(time).format('LLLL');
    };
  }
}());
