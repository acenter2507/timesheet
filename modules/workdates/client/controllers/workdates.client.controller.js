(function () {
  'use strict';

  // Workdates controller
  angular
    .module('workdates')
    .controller('WorkdatesController', WorkdatesController);

  WorkdatesController.$inject = ['$scope', '$state', '$window', 'workdateResolve', 'ngDialog'];

  function WorkdatesController($scope, $state, $window, workdate, ngDialog) {
    var vm = this;

    vm.workdate = workdate;
    console.log(vm.workdate);
    vm.date = moment().year(vm.workdate.workmonth.year).month(vm.workdate.month - 1).date(vm.workdate.date);

    vm.error = {
      start: { error: false, message: '' },
      end: { error: false, message: '' },
      middleRest: { error: false, message: '' },
    };
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
      // Verify Start
      var isError = false;
      if (vm.workdate.start !== '' && vm.workdate.end !== '' && vm.workdate.content !== '' && vm.workdate.middleRest !== '') {
        console.log('All field inputed');
      } else if (vm.workdate.start === '' && vm.workdate.end === '' && vm.workdate.content === '' && vm.workdate.middleRest === '') {
        console.log('All field empty');
      } else {
        if (vm.workdate.start === '') {
          vm.error.start = { error: true, message: '開始時間を入力してください！' };
          isError = true;
          console.log('start field empty');
        }
        if (vm.workdate.end === '') {
          vm.error.end = { error: true, message: '終了時間を入力してください！' };
          isError = true;
          console.log('end field empty');
        }
        console.log('content: ', vm.workdate.content);
        if (vm.workdate.content === '') {
          vm.error.content = { error: true, message: '作業内容を入力してください！' };
          isError = true;
          console.log('content field empty');
        }
        if (vm.workdate.middleRest === '') {
          vm.error.middleRest = { error: true, message: '休憩時間を入力してください！' };
          isError = true;
          console.log('middleRest field empty');
        }
      }
      if (isError) return;
      // Verify ENd
      // Verify 
    };

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
