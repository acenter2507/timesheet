'use strict';

angular.module('core').factory('NumberUtil', NumberUtil);

NumberUtil.$inject = [];
function NumberUtil() {
  // Làm tròn số
  this.precisionRound = (number, precision) => {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  };
  return this;
}
