(function () {
  'use strict';

  // Rests controller
  angular
    .module('rests')
    .controller('RestInputController', RestInputController);

  RestInputController.$inject = ['$scope', '$state', 'restResolve', 'HolidaysService', 'DateUtil', 'Socket'];

  function RestInputController($scope, $state, rest, HolidaysService, DateUtil, Socket) {
    var vm = this;
    vm.rest = rest;
    vm.busy = false;
    vm.form = {};

    onCreate();
    function onCreate() {
      if (!vm.rest._id) {
        // Set status is Not send
        vm.rest.status = 1;
        vm.rest.duration = 0;
      } else {
        vm.rest.start = moment(vm.rest.start).format('YYYY/MM/DD');
        vm.rest.end = moment(vm.rest.end).format('YYYY/MM/DD');
      }
      prepareCalendar();
      prepareHodidays();
      prepareParams();
    }

    function prepareParams() {
    }
    function prepareHodidays() {
      HolidaysService.query().$promise.then(function (result) {
        vm.holidays = result;
        vm.rest.holiday = (vm.rest._id) ? vm.rest.holiday._id || vm.rest.holiday : vm.holidays[0]._id || undefined;
      });
    }
    function prepareScopeListener() {
      $scope.$on('$destroy', function () {
      });
    }
    function prepareCalendar() {
      vm.calendar = { view: 'month' };
      vm.calendar.viewDate = moment().startOf('month').toDate();
      vm.tempStart = (typeof vm.rest.start === 'string') ? moment(vm.rest.start, 'YYYY/MM/DD').format() : vm.rest.start;
      vm.tempEnd = (typeof vm.rest.end === 'string') ? moment(vm.rest.end, 'YYYY/MM/DD').format() : vm.rest.end;

      vm.calendar.cellModifier = function (cell) {
        // cell.cssClass = 'odd-cell';
        var date = cell.date.format('YYYY/MM/DD');

        // 週末チェック
        if (DateUtil.isWeekend(cell.date)) {
          return;
        }

        // 祝日チェック
        var offdate = JapaneseHolidays.isHoliday(new Date(date));
        if (offdate) {
          cell.cssClass = 'off-cell';
          return;
        }

        // 選択された範囲チェック
        if (cell.date.isBetween(vm.tempStart, vm.tempEnd, null, '[]')) {
          cell.cssClass = 'selected-cell';
          return;
        }
      };
    }
    vm.handleCalendarEventClicked = () => {
      return false;
    };
    vm.handleCalendarRangeSelected = (start, end) => {
      vm.rest.start = start;
      vm.rest.end = end;
      vm.handleRestRangeChanged();
    };
    vm.handleCalendarClicked = date => {
      if (DateUtil.isWorkOffDate(date)) return;
      vm.rest.start = date;
      vm.rest.end = date;

      vm.handleRestRangeChanged();
    };
    vm.handleSaveRest = isValid => {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.restForm');
        $scope.handleShowToast('休暇情報が間違います。再確認ください！', true);
        return false;
      }
      vm.busy = true;
      var holiday = _.findWhere(vm.holidays, { _id: vm.rest.holiday });
      vm.rest.isPaid = holiday.isPaid;
      if (vm.rest._id) {
        vm.rest.$update(successCallback, errorCallback);
      } else {
        vm.rest.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        vm.busy = false;
        Socket.emit('request', { restId: res, userId: $scope.user._id });
        $state.go('rests.view', { restId: res._id });
      }

      function errorCallback(res) {
        $scope.handleShowToast(res.data.message, true);
        vm.busy = false;
      }
    };
    vm.handleRestRangeChanged = () => {
      if (!vm.rest.start || !vm.rest.end) {
        vm.rest.duration = 0;
        return;
      }
      var start = (typeof vm.rest.start === 'string') ? moment(vm.rest.start, 'YYYY/MM/DD') : moment(vm.rest.start);
      var end = (typeof vm.rest.end === 'string') ? moment(vm.rest.end, 'YYYY/MM/DD') : moment(vm.rest.end);
      var duration = DateUtil.getWorkDays(start, end);
      if (duration < 0) {
        $scope.handleShowToast('開始日または終了日が間違います。', true);
        vm.rest.duration = 0;
        return;
      }
      vm.rest.duration = duration;
      prepareCalendar();
    };
    vm.handleRestDurationChanged = () => {
      if (!vm.rest.start || !vm.rest.end) {
        vm.rest.duration = 0;
        return;
      }
      if (vm.rest.duration <= 0) {
        $scope.handleShowToast('休暇の期間が無効になっています。', true);
        vm.handleRestRangeChanged();
        return;
      }
      var start = moment(vm.rest.start);
      var end = moment(vm.rest.end);
      var duration = DateUtil.getWorkDays(start, end);
      if (vm.rest.duration > duration) {
        vm.rest.duration = duration;
        prepareCalendar();
        $scope.handleShowToast('期間が超えています。', true);
        return;
      }
      if (vm.rest.duration < (duration - 0.5)) {
        vm.rest.duration = duration - 0.5;
        prepareCalendar();
        $scope.handleShowToast('期間が間違います。', true);
        return;
      }
    };
    vm.disableWeekend = (date, mode) => {
      var holiday = JapaneseHolidays.isHoliday(new Date(date));
      return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6) || holiday);
    };

    // Save Rest
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.restForm');
        return false;
      }

      if (vm.rest._id) {
        vm.rest.$update(successCallback, errorCallback);
      } else {
        vm.rest.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('rests.view', {
          restId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }

  }
}());
