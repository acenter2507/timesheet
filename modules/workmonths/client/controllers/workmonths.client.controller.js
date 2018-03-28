(function () {
  'use strict';

  // Workmonths controller
  angular
    .module('workmonths')
    .controller('WorkmonthsController', WorkmonthsController);

  WorkmonthsController.$inject = ['$scope', '$state', '$window', 'workmonthResolve', 'WorkrestsApi', 'WorkdatesService'];

  function WorkmonthsController($scope, $state, $window, workmonth, WorkrestsApi, WorkdatesService) {
    var vm = this;

    vm.workmonth = workmonth;
    console.log(vm.workmonth);
    vm.datas = [];
    vm.currentMonth = moment().year(vm.workmonth.year).month(vm.workmonth.month - 1);

    vm.syncData = false;

    vm.busy = false;
    vm.stopped = false;
    vm.dates = [];

    onCreate();
    function onCreate() {
      vm.syncData = true;
      prepareDates()
        .then(() => {
          return preapreWorkdates();
        })
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
        console.log(vm.workmonth);
        // for (var index = 0; index < vm.dates.length; index++) {
        //   var date = vm.dates[index];
        //   var workdate = _.findWhere(vm.workmonth.workdates, { month: date.month() + 1, date: date.date() });
        //   var workrests = getRestByDate(date);

        //   var workrest_ids = _.pluck(workrests, '_id');





          // Trường hợp workdate đã được tạo
          // if (workdate) {
          //   var diff = _.difference(workdate.workrests, workrests);
          //   if (diff.length > 0) {
          //     workdate.workrests = workrests;
          //     var rs_workdate = new WorkdatesService(workdate);
          //     workdatesSave.push(rs_workdate.$update());
          //   }
          // } else {
          //   if (workrests.length > 0) {
          //     var rs_workdate = new WorkdatesService({
          //       month: date.month() + 1,
          //       date: date.date(),
          //       day: date.day(),
          //       workrests: workrests
          //     });
          //     rs_workdate.$save(res => {
          //       vm.datas.push({ date: date, workdate: res });
          //     });
          //     workdatesSave.push(rs_workdate.$save());
          //   }
          // }
          // vm.datas.push({ date: date, workdate: workdate });
        // }
        return resolve();
      });
    }
    function preapreWorkdates() {
      return new Promise((resolve, reject) => {
        var workdatesSave = [];
        for (var index = 0; index < vm.dates.length; index++) {
          var date = vm.dates[index];
          var workdate = _.findWhere(vm.workmonth.workdates, { month: date.month() + 1, date: date.date() });
          if (!workdate || workdate._id) {
            var rs_workdate = new WorkdatesService({
              workmonth: vm.workmonth._id,
              month: date.month() + 1,
              date: date.date(),
              day: date.day()
            });
            workdatesSave.push(rs_workdate.$save());
          }
        }
        Promise.all(workdatesSave).then(workrdates => {
          for (let index = 0; index < workrdates.length; index++) {
            const element = workrdates[index];
            vm.workmonth.workdates.push(element);
          }
          vm.workmonth.$update(() => {
            return resolve();
          });
        });
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
