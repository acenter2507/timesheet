(function () {
  'use strict';

  // Rests controller
  angular
    .module('workrests')
    .controller('WorkrestInputController', WorkrestInputController);

  WorkrestInputController.$inject = ['$scope', '$state', 'workrestResolve', 'HolidaysService', 'DateUtil', 'Socket'];

  function WorkrestInputController($scope, $state, workrest, HolidaysService, DateUtil, Socket) {
    var vm = this;
    vm.workrest = workrest;
    vm.busy = false;
    vm.form = {};

    onCreate();
    function onCreate() {
      if (!vm.workrest._id) {
        // Set status is Not send
        vm.workrest.status = 1;
        vm.workrest.duration = 0;
      } else {
        vm.workrest.start = moment(vm.workrest.start).format('YYYY/MM/DD');
        vm.workrest.end = moment(vm.workrest.end).format('YYYY/MM/DD');
      }
      prepareCalendar();
      prepareHodidays();
    }

    function prepareHodidays() {
      HolidaysService.query().$promise.then(function (result) {
        vm.holidays = result;
        if (vm.holidays.length === 0) return;
        vm.workrest.holiday = (vm.workrest._id) ? vm.workrest.holiday._id || vm.workrest.holiday : vm.holidays[0]._id || undefined;
      });
    }
    function prepareScopeListener() {
      $scope.$on('$destroy', function () {
      });
    }
    function prepareCalendar() {
      vm.calendar = { view: 'month' };
      vm.calendar.viewDate = moment().startOf('month').toDate();
      vm.tempStart = (typeof vm.workrest.start === 'string') ? moment(vm.workrest.start, 'YYYY/MM/DD').format() : vm.workrest.start;
      vm.tempEnd = (typeof vm.workrest.end === 'string') ? moment(vm.workrest.end, 'YYYY/MM/DD').format() : vm.workrest.end;

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
      vm.workrest.start = start;
      vm.workrest.end = end;
      vm.handleRestRangeChanged();
    };
    vm.handleCalendarClicked = date => {
      if (DateUtil.isWorkOffDate(date)) return;
      vm.workrest.start = date;
      vm.workrest.end = date;

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
      vm.workrest.isPaid = holiday.isPaid;
      if (vm.workrest._id) {
        vm.workrest.$update(successCallback, errorCallback);
      } else {
        vm.workrest.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        vm.busy = false;
        Socket.emit('rest_request', { workrestId: res, userId: $scope.user._id });
        $state.go('workrests.view', { workrestId: res._id });
      }

      function errorCallback(res) {
        $scope.handleShowToast(res.data.message, true);
        vm.busy = false;
      }
    };
    vm.handleRestRangeChanged = () => {
      if (!vm.workrest.start || !vm.workrest.end) {
        vm.workrest.duration = 0;
        return;
      }
      var start = (typeof vm.workrest.start === 'string') ? moment(vm.workrest.start, 'YYYY/MM/DD') : moment(vm.workrest.start);
      var end = (typeof vm.workrest.end === 'string') ? moment(vm.workrest.end, 'YYYY/MM/DD') : moment(vm.workrest.end);
      var duration = DateUtil.getWorkDays(start, end);
      if (duration < 0) {
        $scope.handleShowToast('開始日または終了日が間違います。', true);
        vm.workrest.duration = 0;
        return;
      }
      vm.workrest.duration = duration;
      prepareCalendar();
    };
    vm.handleRestDurationChanged = () => {
      if (!vm.workrest.start || !vm.workrest.end) {
        vm.workrest.duration = 0;
        return;
      }
      if (vm.workrest.duration <= 0) {
        $scope.handleShowToast('休暇の期間が無効になっています。', true);
        vm.handleRestRangeChanged();
        return;
      }
      var start = moment(vm.workrest.start);
      var end = moment(vm.workrest.end);
      var duration = DateUtil.getWorkDays(start, end);
      if (vm.workrest.duration > duration) {
        vm.workrest.duration = duration;
        prepareCalendar();
        $scope.handleShowToast('期間が超えています。', true);
        return;
      }
      if (vm.workrest.duration < (duration - 0.5)) {
        vm.workrest.duration = duration - 0.5;
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
        $scope.$broadcast('show-errors-check-validity', 'vm.form.workrestForm');
        return false;
      }

      if (vm.workrest._id) {
        vm.workrest.$update(successCallback, errorCallback);
      } else {
        vm.workrest.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('workrests.view', {
          workrestId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }

  }
}());
