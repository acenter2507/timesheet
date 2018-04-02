'use strict';

angular.module('core').factory('Constant', Constant);

Constant.$inject = [];
function Constant() {
  // Thời gian làm việc trong ngày
  this.workRange = 7.5;
  // Thời gian bắt đầu tính overnight
  this.overnightStart = '22:00';
  // Thời gian kết thúc tính overnight
  this.overnightEnd = '05:00';
  return this;
}
