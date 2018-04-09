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

    // Lấy danh sách các loại ngày nghỉ
    function prepareHodidays() {
      HolidaysService.query().$promise.then(function (result) {
        vm.holidays = result;
        if (vm.holidays.length === 0) return;
        vm.workrest.holiday = (vm.workrest._id) ? vm.workrest.holiday._id || vm.workrest.holiday : vm.holidays[0]._id || undefined;
      });
    }
    // Chuẩn bị dữ liệu hiển thị Calendar
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
      prepareCalendar();
    };
    vm.handleCalendarClicked = date => {
      if (DateUtil.isWorkOffDate(date)) return;
      vm.workrest.start = date;
      vm.workrest.end = date;
      prepareCalendar();
    };
    vm.handleRestRangeChanged = () => {
      prepareCalendar();
    };
    vm.handleSaveRest = isValid => {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.restForm');
        $scope.handleShowToast('休暇情報が間違います。再確認ください！', true);
        return false;
      }
      // Kiểm tra ngày start ngày kết thúc
      var start = (typeof vm.workrest.start === 'string') ? moment(vm.workrest.start, 'YYYY/MM/DD') : moment(vm.workrest.start);
      var end = (typeof vm.workrest.end === 'string') ? moment(vm.workrest.end, 'YYYY/MM/DD') : moment(vm.workrest.end);
      var duration = DateUtil.getWorkDays(start, end);
      if (duration < 0) {
        $scope.handleShowToast('開始日または終了日が間違います。', true);
        return false;
      }
      vm.workrest.duration = duration;

      vm.busy = true;
      // Loại ngày nghỉ
      var holiday = _.findWhere(vm.holidays, { _id: vm.workrest.holiday });
      // Kiểm tra loại hình nghỉ và thời hạn ngày đã chọn
      if (holiday.unit < 1 && vm.workrest.duration > 1) {
        // Trường hợp đơn vị loại ngày nghỉ là 0.5 thì không thể chọn được nghỉ nhiều ngày
        $scope.handleShowToast('休暇形態と休暇の期間が合いません！', true);
        vm.busy = false;
        return;
      }
      if (holiday.unit < 1 && vm.workrest.duration === 1) {
        // Trường hợp loại ngày nghỉ là nửa ngày thì chuyển duration về nửa ngày
        vm.workrest.duration = holiday.unit;
      }
      
      vm.workrest.isPaid = holiday.isPaid;
      vm.workrest.hours = holiday.hours;

      // vm.workrest.start = moment(vm.rest_start).format('YYYY/MM/DD');
      // vm.workrest.end = moment(vm.rest_end).format('YYYY/MM/DD');
      console.log(vm.workrest);

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
    vm.disableWeekend = (date, mode) => {
      var holiday = JapaneseHolidays.isHoliday(new Date(date));
      return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6) || holiday);
    };

  }
}());
