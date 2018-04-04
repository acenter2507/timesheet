(function () {
  'use strict';

  // Workmonths controller
  angular
    .module('workmonths')
    .controller('WorkmonthsController', WorkmonthsController);

  WorkmonthsController.$inject = ['$scope', '$state', '$window', 'workmonthResolve', 'WorkrestsApi', 'WorkdatesService', 'DateUtil', 'ngDialog', 'CommonService'];

  function WorkmonthsController($scope, $state, $window, workmonth, WorkrestsApi, WorkdatesService, DateUtil, ngDialog, CommonService) {
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

    function preapreWorkdates() {
      return new Promise((resolve, reject) => {
        var workdatesSave = [];
        for (var index = 0; index < vm.dates.length; index++) {
          var date = vm.dates[index];
          var workdate = _.findWhere(vm.workmonth.workdates, { month: date.month() + 1, date: date.date() });
          if (!workdate) {
            var rs_workdate = new WorkdatesService({
              workmonth: vm.workmonth._id,
              month: date.month() + 1,
              date: date.date(),
              day: date.day(),
              isHoliday: DateUtil.isWeekend(date) || JapaneseHolidays.isHoliday(new Date(date.format('YYYY/MM/DD')))
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
    function prepareShowingData() {
      return new Promise((resolve, reject) => {
        var workdatesSave = [];
        for (var index = 0; index < vm.dates.length; index++) {
          var date = vm.dates[index];
          var workdate = _.findWhere(vm.workmonth.workdates, { month: date.month() + 1, date: date.date() });

          // Nếu là cuối tuần thì ko apply ngày nghỉ
          if (DateUtil.isWeekend(date)) {
            vm.datas.push({ date: date, workdate: workdate, workrests: [] });
            continue;
          }

          // Nếu ngày hiện tại là ngày lễ
          var offdate = JapaneseHolidays.isHoliday(new Date(date.format('YYYY/MM/DD')));
          if (offdate) {
            vm.datas.push({ date: date, workdate: workdate, workrests: [] });
            continue;
          }

          var workrests = getRestByDate(date);
          var workrest_ids = _.pluck(workrests, '_id');

          console.log(workdate.workrests);
          console.log(workrest_ids);
          console.log("-------------------------------");

          if (!CommonService.comapreTwoArrays(workdate.workrests, workrest_ids)) {
            var rs_workdate = new WorkdatesService({ _id: workdate._id, workrests: workrest_ids });
            workdate.workrests = workrest_ids;
            workdatesSave.push(rs_workdate.$update());
          }
          vm.datas.push({ date: date, workdate: workdate, workrests: workrests });
        }
        Promise.all(workdatesSave).then(() => {
          return resolve();
        });
      });
    }
    function getRestByDate(date) {
      var workrests = [];
      for (let index = 0; index < vm.workrests.length; index++) {
        const rest = vm.workrests[index];
        var start = moment(rest.start).format();
        var end = moment(rest.end).format();
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
    vm.createWorkDateBusy = false;
    vm.handleCreateWorkDate = item => {
      if (vm.createWorkDateBusy) return;
      vm.createWorkDateBusy = true;
      var workrests = [];
      var workrest_ids = [];
      var offdate = JapaneseHolidays.isHoliday(new Date(item.date.format('YYYY/MM/DD')));
      if (!DateUtil.isWeekend(item.date) && !offdate) {
        workrests = getRestByDate(item.date);
        workrest_ids = _.pluck(workrests, '_id');
      }
      var rs_workdate = new WorkdatesService({
        workmonth: vm.workmonth._id,
        month: item.date.month() + 1,
        date: item.date.date(),
        day: item.date.day(),
        workrests: workrest_ids
      });

      rs_workdate.$save(res => {
        item.workdate = res;
        item.workrests = workrests;
        vm.createWorkDateBusy = false;
      });
    };

    vm.handleViewWorkrest = item => {
      $scope.item = item;
      var mDialog = ngDialog.open({
        template: 'workrests_list.html',
        scope: $scope
      });
      mDialog.closePromise.then(function (res) {
        delete $scope.item;
      });
    };

    vm.handleEditWorkDate = item => {
      if (!item.workdate || !item.workdate._id) return;
      $state.go('workdates.view', { workdateId: item.workdate._id });
    };
  }
}());
