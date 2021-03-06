(function () {
  'use strict';

  // Workdates controller
  angular
    .module('workdates')
    .controller('WorkdatesController', WorkdatesController);

  WorkdatesController.$inject = [
    '$scope',
    'workdateResolve',
    'ngDialog',
    'NumberUtil',
    'Constant',
    'CommonService',
    'WorkmonthsApi',
    'WorkdatesService'];

  function WorkdatesController(
    $scope,
    workdate,
    ngDialog,
    NumberUtil,
    Constant,
    CommonService,
    WorkmonthsApi,
    WorkdatesService) {
    var vm = this;

    vm.Constant = Constant;
    vm.workdate = workdate;
    vm.form = {};

    vm.error = {};
    vm.date = moment().year(vm.workdate.workmonth.year).month(vm.workdate.month - 1).date(vm.workdate.date);

    vm.busy = false;

    vm.handleSetDefaultWorkdateInfo = function () {
      vm.workdate.start = '09:00';
      vm.workdate.end = '17:30';
      vm.workdate.middleRest = 1;
      vm.handleChangedInput();
    };
    vm.handleClearWorkdateInfo = function () {
      vm.workdate.content = '';
      vm.workdate.start = '';
      vm.workdate.end = '';
      vm.workdate.middleRest = 0;
      vm.handleChangedInput();
    };
    vm.handleSaveWorkdate = function () {
      if (vm.busy) return;
      vm.busy = true;
      var isError = false;
      vm.error = {};

      // Trường hợp tất cả các trường đều trống
      if (CommonService.isStringEmpty(vm.workdate.start) && CommonService.isStringEmpty(vm.workdate.end) && CommonService.isStringEmpty(vm.workdate.content)) {
        $scope.handleShowConfirm({
          message: '全ての項目が空欄になっていますがよろしいでしょうか？'
        }, function () {
          handleStartSave();
        });
        return false;
      } else if (!CommonService.isStringEmpty(vm.workdate.start) && !CommonService.isStringEmpty(vm.workdate.end) && !CommonService.isStringEmpty(vm.workdate.content) && vm.workdate.middleRest >= 0) {
        isError = false;
      } else {
        if (CommonService.isStringEmpty(vm.workdate.start)) {
          vm.error.start = { error: true, message: '開始時間を入力してください！' };
          isError = true;
        }
        if (CommonService.isStringEmpty(vm.workdate.end)) {
          vm.error.end = { error: true, message: '終了時間を入力してください！' };
          isError = true;
        }
        if (CommonService.isStringEmpty(vm.workdate.content)) {
          vm.error.content = { error: true, message: '作業内容を入力してください！' };
          isError = true;
        }
        if (vm.workdate.middleRest < 0) {
          vm.error.middleRest = { error: true, message: '休憩時間は0以上入力してください！' };
          isError = true;
        }
      }
      if (isError) {
        vm.busy = false;
        return;
      }
      // Verify Start
      if (!moment(vm.workdate.start, 'HH:mm', true).isValid()) {
        vm.error.start = { error: true, message: '時間フォーマットが違います！' };
        isError = true;
      }
      if (!moment(vm.workdate.end, 'HH:mm', true).isValid()) {
        vm.error.end = { error: true, message: '時間フォーマットが違います！' };
        isError = true;
      }
      if (isError) {
        vm.busy = false;
        return;
      }
      handleStartSave();
    };
    function handleStartSave() {
      var transfers = _.pluck(vm.workdate.transfers, '_id');
      var rs_workdate = new WorkdatesService({
        _id: vm.workdate._id,
        content: vm.workdate.content,
        start: vm.workdate.start,
        end: vm.workdate.end,
        middleRest: vm.workdate.middleRest,
        overtime: vm.workdate.overtime,
        overnight: vm.workdate.overnight,
        work_duration: vm.workdate.work_duration,
        transfers: transfers,
      });
      vm.busy = false;
      rs_workdate.$update(function () {
        vm.busy = false;
        $scope.handleShowToast('勤務時間を保存しました！', false);
      });
    }
    vm.handleChangedInput = function () {
      var isError = false;
      // 1 trong 3 trường bị trống
      if (CommonService.isStringEmpty(vm.workdate.start) || CommonService.isStringEmpty(vm.workdate.end)) {
        isError = true;
      }
      if (vm.workdate.middleRest < 0) {
        isError = true;
      }
      // 1 trong 2 trường thời gian bị sai
      if (!moment(vm.workdate.start, 'HH:mm', true).isValid() || !moment(vm.workdate.end, 'HH:mm', true).isValid()) {
        isError = true;
      }

      if (isError) return;

      // Tính thời gian có mặt ở công ty
      var start = moment(vm.workdate.start, 'HH:mm');
      var end = moment(vm.workdate.end, 'HH:mm');
      var overnightStart = moment(Constant.overnightStart, 'HH:mm');
      var overnightEnd = moment(Constant.overnightEnd, 'HH:mm');

      // Tổng thời gian có mặt tại công ty trong ngày
      var work_duration = 0;
      // Thời gian làm thêm giờ
      var overtime_duration = 0;
      // Thời gian làm đềm (từ mốc giờ đã set trước)
      var overnight_duration = 0;

      // Thời gian làm việc từ lúc bắt đầu đến lúc tính overnight
      var before_overnight_duration = 0;
      // Thời gian làm việc từ lúc bắt đầu tính overnight đến nữa đêm
      var overnight_to_midnight_duration = 0;
      // Thời gian làm việc từ lúc nữa đêm đến kết thúc tính overnight
      var midnight_to_endovernight_duration = 0;
      // Thời gian làm việc từ lúc kết thúc tính overnight đến về
      var endovernight_to_end_duration = 0;
      // Thời gian làm việc từ nửa đêm đến kết thúc
      var midnight_to_end_duration = 0;
      // Thời gian tính làm việc tiêu chuẩn trong 1 ngày
      var work_range = 0;
      // Tính thời gian nghỉ giải lao
      vm.workdate.middleRest = NumberUtil.precisionRound(vm.workdate.middleRest, 1);

      // Nếu là ngày bình thường (ngày nghỉ = 0)
      if (!vm.workdate.isHoliday) {
        work_range = Constant.workRange;
      }
      // TODO
      // Đối với trường hợp ngày bình thường, xin nghỉ 1 buổi, hoặc cả ngày nhưng vẫn đi làm
      // Xin nghỉ 1 buổi thì phải làm trên 7.5 mới tính OT
      // Xin nghỉ 1 ngày thì mặc định thời gian làm đều tính là OT

      // Trường hợp End nhỏ hơn start (làm qua đêm)
      if (end.isBefore(start) || end.isSame(start)) {
        // Mốc thời gian kết thúc 1 ngày
        var temp_max = moment('24:00', 'HH:mm');
        // Mốc thời gian bắt đầu 1 ngày
        var temp_min = moment('00:00', 'HH:mm');
        // Tính thời gian làm việc từ lúc bắt đầu đến thời điểm tính overnight
        before_overnight_duration = overnightStart.diff(start, 'hours', true);
        // Tính thời gian làm việc từ lúc overnight đến nữa đêm
        overnight_to_midnight_duration = temp_max.diff(overnightStart, 'hours', true);

        // Tính trường hợp kết thúc trước khi hết tính overnight
        if (end.isBefore(overnightEnd) || end.isSame(overnightEnd)) {
          // Tính thời gian làm giệc từ lúc nữa đêm đến khi kết thúc
          midnight_to_end_duration = end.diff(temp_min, 'hours', true);
          // Thời gian overnight
          overnight_duration = overnight_to_midnight_duration + midnight_to_end_duration;
          // Tính tổng thời gian làm việc trong ngày
          work_duration = before_overnight_duration + overnight_duration;
          // Tính thời gian làm thêm giờ
          overtime_duration = NumberUtil.precisionRound(work_duration - vm.workdate.middleRest - work_range - overnight_duration, 1);
        } else {
          // Tính thời gian từ nửa đêm đến thời điểm kết thúc ovetnight
          midnight_to_endovernight_duration = overnightEnd.diff(temp_min, 'hours', true);
          // Tính thời gian từ lúc kết thúc overnight đến khi về
          endovernight_to_end_duration = end.diff(overnightEnd, 'hours', true);
          // Thời gian overnight
          overnight_duration = overnight_to_midnight_duration + midnight_to_endovernight_duration;
          // Tính tổng thời gian làm việc trong ngày
          work_duration = before_overnight_duration + overnight_duration + endovernight_to_end_duration;
          // Tính thời gian làm thêm giờ
          overtime_duration = NumberUtil.precisionRound(work_duration - vm.workdate.middleRest - work_range - overnight_duration, 1);
        }
      } else {
        // Trường hợp kết thúc trước thời gian tính overnight
        if (end.isBefore(overnightStart) || end.isSame(overnightStart)) {
          // Thời gian làm việc cả ngày
          work_duration = end.diff(start, 'hours', true);
          // Thời gian overnight
          overnight_duration = 0;
          // Tính thời gian làm thêm giờ
          overtime_duration = NumberUtil.precisionRound(work_duration - vm.workdate.middleRest - work_range - overnight_duration, 1);
        } else {
          // Trường hợp kết thúc trong khoảng overnight đến nữa đêm
          // Tính thời gian bắt đầu đến lúc overnight
          before_overnight_duration = overnightStart.diff(start, 'hours', true);
          // Tính thời gian từ lúc overnight đến lúc kết thúc
          overnight_duration = end.diff(overnightStart, 'hours', true);
          // Tổng thời gian làm việc trong ngày
          work_duration = before_overnight_duration + overnight_duration;
          // Tính thời gian làm thêm giờ
          overtime_duration = NumberUtil.precisionRound(work_duration - vm.workdate.middleRest - work_range - overnight_duration, 1);
        }
      }

      vm.workdate.overtime = overtime_duration;
      vm.workdate.overnight = overnight_duration;
      vm.workdate.work_duration = work_duration;
    };
    vm.handleCompensatoryOff = function () {
      if (vm.busy) {
        return;
      }
      // Kiểm tra trong tháng có tồn tại ngày cuối tuần có đi làm không
      var workmonthId = vm.workdate.workmonth._id || vm.workdate.workmonth;
      vm.busy = true;
      WorkmonthsApi.getHolidayWorking(workmonthId)
        .success(function (res) {
          if (res.length === 0) {
            $scope.handleShowToast('今月は休日に出勤したことがありません。', true);
            vm.busy = false;
          } else {
            $scope.workdates = res;
            $scope.workdates.forEach(function (workdate) {
              if (_.findWhere(vm.workdate.transfers, { _id: workdate._id })) {
                workdate.selected = true;
              }
            });
            ngDialog.openConfirm({
              templateUrl: 'workdates_list.html',
              scope: $scope,
              showClose: false
            }).then(function () {
              var selecteds = _.filter($scope.workdates, { selected: true });
              vm.workdate.transfers = selecteds;
              delete $scope.workdates;
              vm.busy = false;
            }, function () {
              delete $scope.workdates;
              vm.busy = false;
            });
          }
        })
        .error(function (err) {
          $scope.handleShowToast(err.message, true);
        });
    };
    vm.handleViewWorkrest = function () {
      $scope.workrests = vm.workdate.workrests;
      var mDialog = ngDialog.open({
        template: 'workrests_list.html',
        scope: $scope,
        showClose: false
      });
      mDialog.closePromise.then(function (res) {
        delete $scope.workrests;
      });
    };
  }
}());
