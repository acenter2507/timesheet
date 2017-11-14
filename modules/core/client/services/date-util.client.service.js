'use strict';

angular.module('core').factory('DateUtil', DateUtil);

DateUtil.$inject = [];
function DateUtil() {
  this.getWorkDays = (start, end) => {
    var duration = end.diff(start, 'days');
    if (duration < 0) {
      return duration;
    }
    if (duration === 0 && (start.day() === 0 || start.day() === 6)) {
      return 0;
    }
    if (duration === 0 && start.day() !== 0 && start.day() !== 6) {
      return 1;
    }
    var cnt = 1;
    var temp;
    for (let index = 1; index <= duration; index++) {
      temp = start.clone().add(index, 'days');
      if (this.isWorkDate()) {
        cnt += 1;
      }
    }
    return cnt;
  };
  this.isHoliday = date => {
    if (moment.isMoment(date)) {
      return JapaneseHolidays.isHoliday(new Date(date.format('YYYY/MM/DD')));
    } else {
      return JapaneseHolidays.isHoliday(new Date(date));
    }
  };
  this.isWeekend = date => {
    if (moment.isMoment(date)) {
      return date.day() === 0 || date.day() === 6;
    } else {
      var m = moment(date);
      return m.day() === 0 || m.day() === 6;
    }
  };
  this.isWorkDate = date => {
    return !(this.isHoliday(date) || this.isWeekend(date));
  };
  this.isWorkOffDate = date => {
    return this.isHoliday(date) || this.isWeekend(date);
  };
  return this;
}
