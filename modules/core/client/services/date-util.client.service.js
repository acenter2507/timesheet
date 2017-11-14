'use strict';

angular.module('core').factory('DateUtil', DateUtil);

DateUtil.$inject = [];
function DateUtil() {
  // 範囲の中に出勤日を取得
  this.getWorkDays = (start, end) => {
    var duration = end.diff(start, 'days');
    if (duration < 0) {
      return duration;
    }
    if (duration === 0 && this.isWeekend(start)) {
      return 0;
    }
    if (duration === 0 && !this.isWeekend(start)) {
      return 1;
    }
    var cnt = 1;
    var temp;
    for (let index = 1; index <= duration; index++) {
      temp = start.clone().add(index, 'days');
      if (this.isWorkDate(temp)) {
        cnt += 1;
      }
    }
    return cnt;
  };
  // 祝日チェック
  this.isHoliday = date => {
    if (moment.isMoment(date)) {
      return JapaneseHolidays.isHoliday(new Date(date.format('YYYY/MM/DD')));
    } else {
      return JapaneseHolidays.isHoliday(new Date(date));
    }
  };
  // 週末チェック
  this.isWeekend = date => {
    if (moment.isMoment(date)) {
      return date.day() === 0 || date.day() === 6;
    } else {
      var m = moment(date);
      return m.day() === 0 || m.day() === 6;
    }
  };
  // 出勤日チェック
  this.isWorkDate = date => {
    return !(this.isHoliday(date) || this.isWeekend(date));
  };
  // 休日チェック
  this.isWorkOffDate = date => {
    return this.isHoliday(date) || this.isWeekend(date);
  };
  return this;
}
