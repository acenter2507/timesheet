(function () {
  'use strict';

  // Workdates controller
  angular
    .module('workdates.admin')
    .controller('WorkdateReviewController', WorkdateReviewController);

  WorkdateReviewController.$inject = ['$scope', '$state', '$window', 'workdateResolve', 'ngDialog', 'NumberUtil', 'Constant', 'CommonService', 'WorkmonthsApi', 'WorkmonthsService', 'WorkdatesService'];

  function WorkdateReviewController($scope, $state, $window, workdate, ngDialog, NumberUtil, Constant, CommonService, WorkmonthsApi, WorkmonthsService, WorkdatesService) {
    var vm = this;

    vm.Constant = Constant;
    vm.workdate = workdate;

    // Backup info
    vm.workdate.bk_start = vm.workdate.start;

    vm.error = {};
    vm.date = moment().year(vm.workdate.workmonth.year).month(vm.workdate.month - 1).date(vm.workdate.date);

    vm.busy = false;

    vm.handleSetDefaultWorkdateInfo = function () {
      vm.workdate.start = '09:00';
      vm.workdate.end = '17:30';
      vm.workdate.middleRest = 1;
      vm.workdate.overtime = 0;
      vm.workdate.overnight = 0;
    };

    vm.handleClearWorkdateInfo = function () {
      vm.workdate.content = '';
      vm.workdate.start = '';
      vm.workdate.end = '';
      vm.workdate.middleRest = 0;
      vm.workdate.overtime = 0;
      vm.workdate.overnight = 0;
    };

    vm.handleSaveWorkdate = function () {
      if (vm.busy) return;
      vm.busy = true;
      var isError = false;
      vm.error = {};

      // Trường hợp tất cả các trường đều trống
      if (CommonService.isStringEmpty(vm.workdate.start) && CommonService.isStringEmpty(vm.workdate.end) && CommonService.isStringEmpty(vm.workdate.content) && vm.workdate.middleRest === 0) {
        $scope.handleShowConfirm({
          message: '全ての項目が空欄になっていますがよろしいでしょうか？'
        }, function () {
          handleStartSave();
        });
        return;
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
        transfers: transfers,
      });
      vm.busy = true;
      rs_workdate.$update(function (res) {
        vm.workdate.workmonth.middleRest = res.workmonth.middleRest;
        vm.workdate.workmonth.numWorkDate = res.workmonth.numWorkDate;
        vm.workdate.workmonth.overnight = res.workmonth.overnight;
        vm.workdate.workmonth.overtime = res.workmonth.overtime;
        vm.busy = false;
        $scope.handleShowToast('勤務時間を保存しました！', false);
      }, function (err) {
        vm.busy = false;
        $scope.handleShowToast('勤務時間を保存できません！', true);
      });
    }

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
  }
}());
