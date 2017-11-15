(function () {
  'use strict';

  angular
    .module('core')
    .filter('LL', LL_format)
    .filter('LLLL', LLLL_format);

  function LL_format() {
    return function (time) {
      return moment(time).format('LL');
    };
  }
  function LLLL_format() {
    return function (time) {
      return moment(time).format('LLLL');
    };
  }
}());
