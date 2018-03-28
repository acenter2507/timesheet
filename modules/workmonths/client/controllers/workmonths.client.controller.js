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
    vm.datas = [];
    vm.currentMonth = moment().year(vm.workmonth.year).month(vm.workmonth.month - 1);

    vm.syncData = false;

    vm.busy = false;
    vm.stopped = false;
    vm.dates = [];

    onCreate();
    function onCreate() {
      vm.syncData = true;
      console.log(vm.workmonth);
      prepareDates()
        .then(() => {
          return prepareRest();
        })
        .then(() => {
          return prepareShowingData();
        })
        .then(isChange => {
          if (isChange) {
            //vm.workmonth.$update();
            console.log('Changed');
          }
          vm.syncData = false;
        });
    }
    // Tạo danh sách các ngày trong tháng
    function prepareDates() {
      return new Promise((resolve, reject) => {
        // Ngày bắt đầu của 1 tháng là 21
        vm.startDate = moment(vm.currentMonth).subtract(1, 'months').date(21);
        // Ngày kết thúc của 1 tháng là 20
        vm.endDate = moment(vm.currentMonth).date(20);
        // Số ngày có trong khoảng bắt đầu và kết thúc
        var durration = vm.endDate.diff(vm.startDate, 'days');
        for (var index = 0; index <= durration; index++) {
          var item = vm.startDate.clone().add(index, 'days');
          vm.dates.push(item);
        }
        return resolve();
      });
    }

    // Lấy danh sách các ngày đã nghỉ trong tháng này
    function prepareRest() {
      return new Promise((resolve, reject) => {
        var startRanger = vm.startDate.clone().startOf('date').format();
        var endRanger = vm.endDate.clone().endOf('date').format();
        console.log(startRanger);
        console.log(endRanger);
        WorkrestsApi.getRestOfCurrentUserInRange(startRanger, endRanger, $scope.user._id)
          .success(res => {
            vm.workrests = res;
            return resolve();
          })
          .error(err => {
            vm.workrests = [];
            $scope.handleShowToast(err.message, true);
            return resolve();
          });
      });
    }

    function prepareShowingData() {
      return new Promise((resolve, reject) => {
        var isChange = false;

        for (var index = 0; index < vm.dates.length; index++) {
          var date = vm.dates[index];
          var workdate = _.findWhere(vm.workmonth.workdates, { month: date.month() + 1, date: date.date() });
          console.log(date.format());
          console.log('--');
          var workrests = getRestByDate(date);
          // Trường hợp workdate đã được tạo
          if (workdate) {
            workdate.workrests = workrests;
            if (workdate.workrests.length !== workrests.length) {
              isChange = true;
            }
          } else {
            if (workrests.length > 0) {
              workdate = new WorkdatesService({
                month: date.month() + 1,
                date: date.date(),
                day: date.day(),
                workrests: workrests
              });
              vm.workmonths.workDates.push(workdate);
              isChange = true;
            }
          }
          vm.datas.push({ date: date, workdate: workdate });
        }
        return resolve(isChange);
      });
    }
    function getRestByDate(date) {
      var workrests = [];
      for (let index = 0; index < vm.workrests.length; index++) {
        const rest = vm.workrests[index];
        var start = moment(rest.start).format();
        var end = moment(rest.end).format();
        console.log(start);
        console.log(end);
        if (date.isBetween(start, end, 'date', '[]')) {
          workrests.push(rest);
        }
      }
      return workrests;
    }
    vm.handlePreviousScreen = handlePreviousScreen;
    function handlePreviousScreen() {
      $state.go($state.previous.state.name || 'workmonths.list', $state.previous.params);
    }

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
