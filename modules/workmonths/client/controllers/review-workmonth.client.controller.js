(function () {
  'use strict';

  // Workmonths controller
  angular
    .module('workmonths')
    .controller('WorkmonthReviewController', WorkmonthReviewController);

  WorkmonthReviewController.$inject = ['$scope', '$state', '$window', 'workmonthResolve', 'WorkdatesApi', 'ngDialog', 'WorkmonthsApi', 'Socket', 'CommonService'];

  function WorkmonthReviewController($scope, $state, $window, workmonth, WorkdatesApi, ngDialog, WorkmonthsApi, Socket, CommonService) {
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
    // Kiểm tra 1 workdate có hợp lệ hay không
    vm.handleAutoCheckWorkdate = handleAutoCheckWorkdate;
    function handleAutoCheckWorkdate (workdate) {
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
      if (!workdate.isHoliday && CommonService.isStringEmpty(workdate.start) && !workdate.transfer_workdate) {
        warnings.push('平日なのに出勤情報がありません！');
      }
      workdate.warnings = warnings;

    }
    // Kiểm tra các ngày trong tháng
    vm.handleAutoCheckWorkmonth = () => {
      vm.workmonth.workdates.forEach(workdate => {
        handleAutoCheckWorkdate(workdate);
      });
      if (!$scope.$$phase) $scope.$digest();
    };
    // Chấp nhận timesheet hợp lệ
    vm.handleApproveWorkmonth = () => {};
    // Không chấp nhận timesheet
    vm.handleRejectWorkmonth = () => {};
    // Xóa bỏ Workmanth
    vm.handleDeleteMonth = () => {};


  }


}());
