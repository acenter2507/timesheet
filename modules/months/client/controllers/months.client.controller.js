(function () {
  'use strict';

  // Months controller
  angular
    .module('months')
    .controller('MonthsController', MonthsController);

  MonthsController.$inject = ['$scope', '$state', '$window', 'monthResolve', 'RestsApi', 'ngDialog'];

  function MonthsController($scope, $state, $window, month, RestsApi, ngDialog) {
    var vm = this;
    vm.month = month;
    vm.form = {};
    vm.datas = [];
    vm.dates = [];
    vm.workrests = [];
    vm.currentMonth = moment().year(vm.month.year).month(vm.month.month - 1);
    vm.createWorkDateBusy = false;
    vm.isShowWorkDateForm = true;
    vm.tmpWork = {};

    vm.busy = false;
    vm.stopped = false;

    onCreate();
    function onCreate() {
      prepareDates()
        .then(() => {
          return prepareRest();
        })
        .then(() => {
          return prepareShowingData();
        })
        .then(isChange => {
          if (isChange) {
            vm.month.$update();
          }
        });
    }
    function prepareDates() {
      return new Promise((resolve, reject) => {
        vm.startDate = moment(vm.currentMonth).subtract(1, 'months').date(21);
        vm.endDate = moment(vm.currentMonth).date(20);
        var durration = vm.endDate.diff(vm.startDate, 'days');
        for (var index = 0; index <= durration; index++) {
          var item = vm.startDate.clone().add(index, 'days');
          vm.dates.push(item);
        }
        return resolve();
      });
    }
    function prepareRest() {
      return new Promise((resolve, reject) => {
        var startRanger = vm.startDate.clone().startOf('date').format();
        var endRanger = vm.endDate.clone().endOf('date').format();
        RestsApi.getRestOfCurrentUserInRange(startRanger, endRanger, $scope.user._id)
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
    function preapreWorkDates() {
      return new Promise((resolve, reject) => {
        for (var index = 0; index < vm.dates.length; index++) {
          var date = vm.dates[index];
          var workDate = _.findWhere(vm.month.workDates, { month: date.month(), date: date.date() });
          var workRests = getRestByDate(date);
          if (workDate._id) {

            if (workDate.workrests.length !== vm.workrests.length) {
              //compareArrays(workDate.workrests, workrests);
            }
          } else {

          }
        }
      });
    }
    function prepareShowingData() {
      return new Promise((resolve, reject) => {
        var isChange = false;
        for (var index = 0; index < vm.dates.length; index++) {
          var date = vm.dates[index];
          var work = _.findWhere(vm.month.workDates, { month: date.month(), date: date.date() });
          var workrests = getRestByDate(date);
          if (work) {
            work.workrests = workrests;
            if (work.workrests.length !== workrests.length) {
              isChange = true;
            }
          } else {
            if (workrests.length > 0) {
              work = {
                month: date.month(),
                date: date.date(),
                day: date.day(),
                workrests: workrests
              };
              vm.month.workDates.push(work);
              isChange = true;
            }
          }
          vm.datas.push({ date: date, work: work });
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
        if (date.isBetween(start, end, 'date', '[]')) {
          workrests.push(rest);
        }
      }
      return workrests;
    }
    function comapreArrays(arr1, arr2) {
      var rest = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arguments, 1));
    }
    // Trở về màn hình trước
    vm.handlePreviousScreen = handlePreviousScreen;
    function handlePreviousScreen() {
      $state.go($state.previous.state.name || 'months.list', $state.previous.params);
    }
    vm.handleCreateWorkDate = item => {
      // Check this date is has any workrests
      // if (item.work.workrests.length > 0 ) {
      //   item.work.start = '00:00';
      // }
      item.isNew = true;
      var tmpWork = {
        start: item.date.clone().hour(0).minute(0),
        end: item.date.clone().hour(0).minute(0),
        middleRest: 0,
        workrests: []
      };
      handleOpenInputTimesheet(item, tmpWork);
    };
    vm.handleEditWorkDate = item => {
      var tmpWork = _.clone(item.work);
      if(!tmpWork.start) {
        tmpWork.start = item.date.clone().hour(0).minute(0);
      }
      if(!tmpWork.end) {
        tmpWork.end = item.date.clone().hour(0).minute(0);
      }
      handleOpenInputTimesheet(item);
    };
    function handleOpenInputTimesheet(item, tmpWork) {
      $scope.item = item;
      $scope.tmpWork = tmpWork;
      $scope.handleSaveWorkDate = handleSaveWorkDate;
      var mDialog = ngDialog.open({
        template: 'timesheetInput.html',
        scope: $scope
      });
      mDialog.closePromise.then(function (res) {
        if (!res.value || res.value === '$document') return;
        // Verify input info
        handleSaveWorkDate(res.value, item);
      });

    }
    function handleSaveWorkDate(workDate, item) {
      console.log(workDate);
      console.log(item);
    }

    // // Remove existing Month
    // function remove() {
    //   if ($window.confirm('Are you sure you want to delete?')) {
    //     vm.month.$remove($state.go('months.list'));
    //   }
    // }

    // // Save Month
    // function save(isValid) {
    //   if (!isValid) {
    //     $scope.$broadcast('show-errors-check-validity', 'vm.form.monthForm');
    //     return false;
    //   }

    //   // TODO: move create/update logic to service
    //   if (vm.month._id) {
    //     vm.month.$update(successCallback, errorCallback);
    //   } else {
    //     vm.month.$save(successCallback, errorCallback);
    //   }

    //   function successCallback(res) {
    //     $state.go('months.view', {
    //       monthId: res._id
    //     });
    //   }

    //   function errorCallback(res) {
    //     vm.error = res.data.message;
    //   }
    // }
  }
}());
