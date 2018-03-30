'use strict';

angular.module('core').factory('Constant', Constant);

Constant.$inject = [];
function Constant() {
  // Thời gian làm việc trong ngày
  this.workRange = 7.5;
  // Thời gian tính là khuya
  this.overnightStart = '22:00';
  return this;
}
