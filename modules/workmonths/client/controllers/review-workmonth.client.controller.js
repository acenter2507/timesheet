(function () {
  'use strict';

  // Workmonths controller
  angular
    .module('workmonths')
    .controller('WorkmonthReviewController', WorkmonthReviewController);

  WorkmonthReviewController.$inject = ['$scope', '$state', 'workmonthResolve', 'WorkdatesApi', 'ngDialog', 'WorkmonthsApi', 'CommonService', 'WorkrestsApi'];

  function WorkmonthReviewController($scope, $state, workmonth, WorkdatesApi, ngDialog, WorkmonthsApi, CommonService, WorkrestsApi) {
    var vm = this;

    vm.workmonth = workmonth;
    vm.currentMonth = moment().year(vm.workmonth.year).month(vm.workmonth.month - 1);
    vm.workrests = [];

    vm.isShowHistory = false;

    onCreate();
    function onCreate() {
      prepareShowingData();
      prepareWorkrests();
    }
    function prepareShowingData() {
      vm.workmonth.workdates.forEach(workdate => {
        workdate.time = moment().year(workdate.year).month(workdate.month - 1).date(workdate.date);
      });
    }
    function prepareWorkrests() {
      var start = vm.currentMonth.clone().subtract(1, 'months').date(21).format();
      var end = vm.currentMonth.clone().date(20).format();
      var userId = vm.workmonth.user._id;
      WorkrestsApi.getRestOfCurrentUserInRange(start, end, userId)
        .success(workrests => {
          vm.workrests = workrests;
          console.log(vm.workrests);
        });
    }
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
    // Xem các thông tin cần thiết của user
    vm.handleViewUserInfo = user => {
      console.log(user);
    };
    // Xem tất cả các comment
    vm.handleViewMoreWorkdateComment = workdate => {
      $scope.tmp_time = moment().year(workdate.year).month(workdate.month - 1).date(workdate.date).format('LL');
      $scope.tmp_comments = workdate.comments;
      ngDialog.openConfirm({
        templateUrl: 'commentsTempalte.html',
        scope: $scope
      }).then(content => {
        delete $scope.tmp_time;
        delete $scope.tmp_comments;
      }, () => {
        delete $scope.tmp_time;
        delete $scope.tmp_comments;
      });
    };
    // Nhập mới 1 comment
    vm.handleWriteWorkdateComment = workdate => {
      ngDialog.openConfirm({
        templateUrl: 'commentTemplate.html',
        scope: $scope
      }).then(content => {
        if (!content || content === '') return;
        var comment = {
          content: content,
          author: $scope.user.displayName,
          time: moment().format('LLLL')
        };
        WorkdatesApi.addComment(workdate._id, comment)
          .success(res => {
            workdate.comments.push(comment);
          })
          .error(err => {
            $scope.handleShowToast(err.message, true);
          });
      }, () => {
        delete $scope.comment;
      });
    };
    // Kiểm tra các ngày trong tháng
    vm.handleAutoCheckWorkmonth = () => {
      vm.workmonth.workdates.forEach(workdate => {
        handleAutoCheckWorkdate(workdate);
      });
      if (!$scope.$$phase) $scope.$digest();
    };
    // Chấp nhận timesheet hợp lệ
    vm.handleApproveWorkmonth = () => {
      $scope.handleShowConfirm({
        message: 'この勤務表を承認しますか？'
      }, () => {
        WorkmonthsApi.approve()
          .success(workmonth => {
            _.extend(vm.workmonth, workmonth);
          })
          .error(err => {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    // Không chấp nhận timesheet
    vm.handleRejectWorkmonth = () => {
      $scope.handleShowConfirm({
        message: 'この勤務表を拒否しますか？'
      }, () => {
        WorkmonthsApi.reject()
          .success(workmonth => {
            _.extend(vm.workmonth, workmonth);
          })
          .error(err => {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    // Xóa bỏ Workmanth
    vm.handleDeleteMonth = () => {
      $scope.handleShowConfirm({
        message: 'この勤務表を完全削除しますか？'
      }, () => {
        vm.workmonth.$remove(() => {
          handlePreviousScreen();
        });
      });
    };
    // Kiểm tra 1 workdate có hợp lệ hay không
    function handleAutoCheckWorkdate(workdate) {
      var warnings = [];
      // Kiểm tra duration của các đơn xin nghỉ
      var rest_duration = 0;
      var isPaid_duration = 0;
      for (let i = 0; i < workdate.workrests.length; i++) {
        const workrest = workdate.workrests[i];
        rest_duration += workrest.duration;
        if (workrest.holiday.isPaid) {
          isPaid_duration += workrest.duration;
        }
      }
      if (rest_duration > 1) {
        warnings.push('休暇の期間が多すぎている。休暇の確認が必要');
      }
      // Kiểm tra có đăng ký nghỉ nhưng vẫn đi làm
      if (isPaid_duration > 0 && !CommonService.isStringEmpty(workdate.start)) {
        warnings.push('休暇が申請されたが出勤しているので残業時間の確認が必要');
      }
      // Kiểm tra thông tin xin nghỉ bù
      if (workdate.transfer_workdate) {
        warnings.push('振替休暇が申請されたので出勤時間の確認が必要');
      }
      // Kiểm tra nếu là ngày lễ, đi làm
      if (workdate.isHoliday && !CommonService.isStringEmpty(workdate.start)) {
        warnings.push('休日に出勤しましたので出勤時間の確認が必要');
      }
      if (workdate.isHoliday && !CommonService.isStringEmpty(workdate.start) && workdate.transfer) {
        warnings.push('この日が振り替えられましたので時間計算の確認が必要');
      }
      if (!workdate.isHoliday && CommonService.isStringEmpty(workdate.start) && !workdate.transfer_workdate && rest_duration === 0) {
        warnings.push('平日なのに出勤情報がありません！');
      }
      workdate.warnings = warnings;

    }

    function handlePreviousScreen() {
      $state.go($state.previous.state.name || 'workmonths.list', $state.previous.params);
    }
  }
}());