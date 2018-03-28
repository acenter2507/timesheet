(function () {
  'use strict';

  // Workmonths controller
  angular
    .module('workmonths')
    .controller('WorkmonthsController', WorkmonthsController);

  WorkmonthsController.$inject = ['$scope', '$state', '$window', 'workmonthResolve', 'WorkrestsApi'];

  function WorkmonthsController ($scope, $state, $window, workmonth, WorkrestsApi) {
    var vm = this;

    vm.workmonth = workmonth;
    vm.currentMonth = moment().year(vm.workmonth.year).month(vm.workmonth.month - 1);

    vm.busy = false;
    vm.stopped = false;
    vm.dates = [];

    // onCreate();
    // function onCreate() {
    //   prepareDates()
    //     .then(() => {
    //       return prepareRest();
    //     })
    //     .then(() => {
    //       return prepareShowingData();
    //     })
    //     .then(isChange => {
    //       if (isChange) {
    //         vm.month.$update();
    //       }
    //     });
    // }

    // function prepareDates() {
    //   return new Promise((resolve, reject) => {
    //     // Ngày bắt đầu của 1 tháng là 21
    //     vm.startDate = moment(vm.currentMonth).subtract(1, 'months').date(21);
    //     // Ngày kết thúc của 1 tháng là 20
    //     vm.endDate = moment(vm.currentMonth).date(20);
    //     // Số ngày có trong khoảng bắt đầu và kết thúc
    //     var durration = vm.endDate.diff(vm.startDate, 'days');
    //     for (var index = 0; index <= durration; index++) {
    //       var item = vm.startDate.clone().add(index, 'days');
    //       vm.dates.push(item);
    //     }
    //     return resolve();
    //   });
    // }

    // function prepareRest() {
    //   return new Promise((resolve, reject) => {
    //     var startRanger = vm.startDate.clone().startOf('date').format();
    //     var endRanger = vm.endDate.clone().endOf('date').format();
    //     WorkrestsApi.getRestOfCurrentUserInRange(startRanger, endRanger, $scope.user._id)
    //       .success(res => {
    //         vm.workrests = res;
    //         return resolve();
    //       })
    //       .error(err => {
    //         vm.workrests = [];
    //         $scope.handleShowToast(err.message, true);
    //         return resolve();
    //       });
    //   });
    // }
    // function prepareShowingData() {
    //   return new Promise((resolve, reject) => {
    //     var isChange = false;
    //     for (var index = 0; index < vm.dates.length; index++) {
    //       var date = vm.dates[index];
    //       var workdate = _.findWhere(vm.workmonth.workdates, { month: date.month(), date: date.date() });
    //       var workrests = getRestByDate(workdate);
    //       if (work) {
    //         work.workrests = workrests;
    //         if (work.workrests.length !== workrests.length) {
    //           isChange = true;
    //         }
    //       } else {
    //         if (workrests.length > 0) {
    //           work = {
    //             month: date.month(),
    //             date: date.date(),
    //             day: date.day(),
    //             workrests: workrests
    //           };
    //           vm.month.workDates.push(work);
    //           isChange = true;
    //         }
    //       }
    //       vm.datas.push({ date: date, work: work });
    //     }
    //     return resolve(isChange);
    //   });
    // }

    // Remove existing Workmonth
    // function remove() {
    //   if ($window.confirm('Are you sure you want to delete?')) {
    //     vm.workmonth.$remove($state.go('workmonths.list'));
    //   }
    // }

    // // Save Workmonth
    // function save(isValid) {
    //   if (!isValid) {
    //     $scope.$broadcast('show-errors-check-validity', 'vm.form.workmonthForm');
    //     return false;
    //   }

    //   // TODO: move create/update logic to service
    //   if (vm.workmonth._id) {
    //     vm.workmonth.$update(successCallback, errorCallback);
    //   } else {
    //     vm.workmonth.$save(successCallback, errorCallback);
    //   }

    //   function successCallback(res) {
    //     $state.go('workmonths.view', {
    //       workmonthId: res._id
    //     });
    //   }

    //   function errorCallback(res) {
    //     vm.error = res.data.message;
    //   }
    // }
  }
}());
