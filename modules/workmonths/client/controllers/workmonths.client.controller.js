(function () {
  'use strict';

  // Workmonths controller
  angular
    .module('workmonths')
    .controller('WorkmonthsController', WorkmonthsController);

  WorkmonthsController.$inject = ['$scope', '$state', '$window', 'workmonthResolve', 'WorkdatesApi', 'ngDialog', 'WorkmonthsApi', 'Socket', 'Constant', 'CommonService', 'NumberUtil', 'WorkdatesService'];

  function WorkmonthsController($scope, $state, $window, workmonth, WorkdatesApi, ngDialog, WorkmonthsApi, Socket, Constant, CommonService, NumberUtil, WorkdatesService) {
    var vm = this;

    vm.workmonth = workmonth;
    console.log(vm.workmonth);
    vm.currentMonth = moment().year(vm.workmonth.year).month(vm.workmonth.month - 1);

    vm.isShowHistory = false;

    onCreate();
    function onCreate() {
      prepareShowingData();
    }
    function prepareShowingData() {
      vm.workmonth.workdates.forEach(workdate => {
        workdate.time = moment().year(workdate.year).month(workdate.month - 1).date(workdate.date);
      });
    }

    // Xem các đơn xin nghỉ trong 1 ngày
    vm.handleViewWorkrest = workdate => {
      WorkdatesApi.getWorkrestsInWorkdate(workdate._id)
        .success(res => {
          $scope.workrests = res;
          $scope.time = workdate.time;
          var mDialog = ngDialog.open({
            template: 'workrests_list.html',
            scope: $scope
          });
          mDialog.closePromise.then(function (res) {
            delete $scope.workrests;
            delete $scope.time;
          });
        })
        .error(err => {
          $scope.handleShowToast(err.message, true);
        });
    };
    // Đến màn hình chỉnh sửa workdate
    vm.handleEditWorkDate = workdate => {
      if (!workdate || !workdate._id) return;
      $state.go('workdates.view', { workdateId: workdate._id });
    };
    // Về màn hình xem workmonth theo năm hiện tại
    vm.handleViewYear = () => {
      $state.go('workmonths.list', { year: vm.workmonth.year });
    };
    // Gửi yêu cầu phê duyệt workmonth
    vm.handleSendRequestMonth = () => {
      $scope.handleShowConfirm({
        message: '勤務表を申請しますか？'
      }, () => {
        WorkmonthsApi.request(vm.workmonth._id)
          .success(data => {
            _.extend(vm.workmonth, data);
            Socket.emit('month_request', { workmonthId: vm.workmonth._id, userId: $scope.user._id });
          })
          .error(err => {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    // Hủy yêu cầu phê duyệt workmonth
    vm.handleCancelRequestMonth = () => {
      $scope.handleShowConfirm({
        message: '勤務表の申請を取り消しますか？'
      }, () => {
        WorkmonthsApi.cancel(vm.workmonth._id)
          .success(data => {
            _.extend(vm.workmonth, data);
          })
          .error(err => {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    vm.handleViewHistory = rest => {
      vm.isShowHistory = true;
    };
    vm.handleCloseHistory = () => {
      vm.isShowHistory = false;
    };
    // Xóa workmonth
    vm.handleDeleteMonth = () => {
      $scope.handleShowConfirm({
        message: '勤務表を削除しますか？'
      }, () => {
        vm.workmonth.$remove(vm.handleViewYear());
      });
    };
    vm.handlePreviousScreen = handlePreviousScreen;
    function handlePreviousScreen() {
      $state.go($state.previous.state.name || 'workmonths.list', $state.previous.params);
    }
    // Chức năng copy workdate
    vm.isCopying = false;
    vm.isSaving = false;
    vm.copyingWorkdate = {};
    // Copy workdate
    vm.handleCopyWorkdate = function (workdate) {
      vm.isCopying = true;
      vm.copyingWorkdate = workdate;
    };
    // Paste workdate
    vm.handlePasteWorkdate = function (workdate) {
      if (vm.isSaving) return;
      vm.isSaving = true;
      workdate.start = vm.copyingWorkdate.start;
      workdate.end = vm.copyingWorkdate.end;
      workdate.middleRest = vm.copyingWorkdate.middleRest;
      workdate.content = vm.copyingWorkdate.content;
      calculateTimeWorkdate(workdate);
      var rs_workdate = new WorkdatesService({
        _id: workdate._id,
        start: workdate.start,
        end: workdate.end,
        content: workdate.content,
        middleRest: workdate.middleRest,
        overtime: workdate.overtime,
        overnight: workdate.overnight,
        work_duration: workdate.work_duration
      });
      rs_workdate.$update(function(res) {
        console.log(res);
        vm.workmonth.middleRest = res.workmonth.middleRest;
        vm.workmonth.numWorkDate = res.workmonth.numWorkDate;
        vm.workmonth.overnight = res.workmonth.overnight;
        vm.workmonth.overtime = res.workmonth.overtime;
        vm.isSaving = false;
      }, function(err) {
        console.log(err);
        vm.isSaving = false;
      });
    };
    // Cancle copy workdate
    vm.handleCancleCopyWorkdate = function () {
      vm.isCopying = false;
      vm.copyingWorkdate = {};
    };

    function calculateTimeWorkdate(workdate) {
      if (CommonService.isStringEmpty(workdate.start) || CommonService.isStringEmpty(workdate.end) || CommonService.isStringEmpty(workdate.content)) {
        return;
      }
      if (workdate.middleRest < 0) {
        return;
      }
      // Tính thời gian có mặt ở công ty
      var start = moment(workdate.start, 'HH:mm');
      var end = moment(workdate.end, 'HH:mm');
      var overnightStart = moment(Constant.overnightStart, 'HH:mm');
      var overnightEnd = moment(Constant.overnightEnd, 'HH:mm');

      // Tổng thời gian có mặt tại công ty trong ngày
      var work_duration = 0;
      // Thời gian làm thêm giờ
      var overtime_duration = 0;
      // Thời gian làm đềm (từ mốc giờ đã set trước)
      var overnight_duration = 0;
      // Thời gian nghỉ giải lao
      var rest_duration = 0;
      // Thời gian tính làm việc tiêu chuẩn trong 1 ngày
      var work_range = 0;

      // Các mốc thời gian
      // Thời gian làm việc từ lúc bắt đầu đến lúc tính overnight
      var before_overnight_duration = 0;
      // Thời gian làm việc từ lúc bắt đầu tính overnight đến nữa đêm
      var overnight_to_midnight_duration = 0;
      // Thời gian làm việc từ nửa đêm đến kết thúc
      var midnight_to_end_duration = 0;
      // Thời gian làm việc từ lúc nữa đêm đến kết thúc tính overnight
      var midnight_to_endovernight_duration = 0;
      // Thời gian làm việc từ lúc kết thúc tính overnight đến về
      var endovernight_to_end_duration = 0;

      // Nếu là ngày bình thường (ngày nghỉ = 0)
      if (!workdate.isHoliday) {
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
          overtime_duration = NumberUtil.precisionRound(work_duration - workdate.middleRest - work_range - overnight_duration, 1);
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
          overtime_duration = NumberUtil.precisionRound(work_duration - workdate.middleRest - work_range - overnight_duration, 1);
        }
      } else {
        // Trường hợp kết thúc trước thời gian tính overnight
        if (end.isBefore(overnightStart) || end.isSame(overnightStart)) {
          // Thời gian làm việc cả ngày
          work_duration = end.diff(start, 'hours', true);
          // Thời gian overnight
          overnight_duration = 0;
          // Tính thời gian làm thêm giờ
          overtime_duration = NumberUtil.precisionRound(work_duration - workdate.middleRest - work_range - overnight_duration, 1);
        } else {
          // Trường hợp kết thúc trong khoảng overnight đến nữa đêm
          // Tính thời gian bắt đầu đến lúc overnight
          before_overnight_duration = overnightStart.diff(start, 'hours', true);
          // Tính thời gian từ lúc overnight đến lúc kết thúc
          overnight_duration = end.diff(overnightStart, 'hours', true);
          // Tổng thời gian làm việc trong ngày
          work_duration = before_overnight_duration + overnight_duration;
          // Tính thời gian làm thêm giờ
          overtime_duration = NumberUtil.precisionRound(work_duration - workdate.middleRest - work_range - overnight_duration, 1);
        }
      }

      workdate.overtime = overtime_duration;
      workdate.overnight = overnight_duration;
      workdate.work_duration = work_duration;
    }
  }
}());
