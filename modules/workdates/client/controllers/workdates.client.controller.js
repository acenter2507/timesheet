(function () {
  'use strict';

  // Workdates controller
  angular
    .module('workdates')
    .controller('WorkdatesController', WorkdatesController);

  WorkdatesController.$inject = ['$scope', '$state', '$window', 'workdateResolve', 'ngDialog', 'NumberUtil'];

  function WorkdatesController($scope, $state, $window, workdate, ngDialog, NumberUtil) {
    var vm = this;

    vm.workdate = workdate;
    console.log(vm.workdate);
    vm.date = moment().year(vm.workdate.workmonth.year).month(vm.workdate.month - 1).date(vm.workdate.date);

    vm.error = {};
    vm.handlePreviousScreen = handlePreviousScreen;
    function handlePreviousScreen() {
      var state = $state.previous.state.name || 'workmonths.view';
      var params = state === 'workmonths.view' ? { workmonthId: vm.workdate.workmonth._id } : $state.previous.params;
      $state.go(state, params);
    }

    vm.handleViewWorkrest = () => {
      $scope.workrests = vm.workdate.workrests;
      var mDialog = ngDialog.open({
        template: 'workrests_list.html',
        scope: $scope
      });
      mDialog.closePromise.then(function (res) {
        delete $scope.workrests;
      });
    };

    vm.handleSetDefaultWorkdateInfo = () => {
      vm.workdate.start = '09:00';
      vm.workdate.end = '17:30';
      vm.workdate.middleRest = 60;
    };

    vm.handleClearWorkdateInfo = () => {
      vm.workdate.content = '';
      vm.workdate.start = '';
      vm.workdate.end = '';
      vm.workdate.middleRest = '';
    };

    vm.handleSaveWorkdate = () => {
      var isError = false;
      vm.error = {};
      if (unInput(vm.workdate.start) && unInput(vm.workdate.end) && unInput(vm.workdate.content) && unInput(vm.workdate.middleRest)) {
        return;
      } else if (!unInput(vm.workdate.start) && !unInput(vm.workdate.end) && unInput(vm.workdate.content) && unInput(vm.workdate.middleRest)) {
        isError = false;
      } else {
        if (unInput(vm.workdate.start)) {
          vm.error.start = { error: true, message: '開始時間を入力してください！' };
          isError = true;
        }
        if (unInput(vm.workdate.end)) {
          vm.error.end = { error: true, message: '終了時間を入力してください！' };
          isError = true;
        }
        if (unInput(vm.workdate.content)) {
          vm.error.content = { error: true, message: '作業内容を入力してください！' };
          isError = true;
        }
        if (unInput(vm.workdate.middleRest)) {
          vm.error.middleRest = { error: true, message: '休憩時間を入力してください！' };
          isError = true;
        }
      }
      if (isError) return;
      // Verify Start
      if (!moment(vm.workdate.start, 'HH:mm', true).isValid()) {
        vm.error.start = { error: true, message: '時間フォーマットが違います！' };
        isError = true;
      }
      if (!moment(vm.workdate.end, 'HH:mm', true).isValid()) {
        vm.error.end = { error: true, message: '時間フォーマットが違います！' };
        isError = true;
      }
      if (isError) return;

      // Verify ENd
      // Verify 
    };

    vm.handleChangedInput = () => {
      if (unInput(vm.workdate.start) || unInput(vm.workdate.end) || unInput(vm.workdate.middleRest)) return;
      if (!moment(vm.workdate.start, 'HH:mm', true).isValid()) {
        return;
      }
      if (!moment(vm.workdate.end, 'HH:mm', true).isValid()) {
        return;
      }
      // Tính thời gian có mặt ở công ty
      var start = moment(vm.workdate.start, 'HH:mm');
      var end = moment(vm.workdate.end, 'HH:mm');
      var duration = end.diff(start, 'hours', true);
      if (duration <= 0) {
        var temp_max = moment('24:00', 'HH:mm');
        var temp_min = moment('00:00', 'HH:mm');
        var temp_1_duration = temp_max.diff(start, 'hours', true);
        var temp_2_duration = end.diff(temp_min, 'hours', true);
        duration = temp_1_duration + temp_2_duration;
      }

      // Tính thời gian nghỉ giải lao
      var middle_rest = NumberUtil.precisionRound(vm.workdate.middleRest / 60, 1);
      console.log(duration);
      console.log(middle_rest);
    };

    function unInput(data) {
      if (!data || data === '') {
        return true;
      }
      return false;
    }

    // // Remove existing Workdate
    // function remove() {
    //   if ($window.confirm('Are you sure you want to delete?')) {
    //     vm.workdate.$remove($state.go('workdates.list'));
    //   }
    // }

    // // Save Workdate
    // function save(isValid) {
    //   if (!isValid) {
    //     $scope.$broadcast('show-errors-check-validity', 'vm.form.workdateForm');
    //     return false;
    //   }

    //   // TODO: move create/update logic to service
    //   if (vm.workdate._id) {
    //     vm.workdate.$update(successCallback, errorCallback);
    //   } else {
    //     vm.workdate.$save(successCallback, errorCallback);
    //   }

    //   function successCallback(res) {
    //     $state.go('workdates.view', {
    //       workdateId: res._id
    //     });
    //   }

    //   function errorCallback(res) {
    //     vm.error = res.data.message;
    //   }
    // }
  }
}());
