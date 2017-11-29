(function () {
  'use strict';

  // Months controller
  angular
    .module('months')
    .controller('MonthsController', MonthsController);

  MonthsController.$inject = ['$scope', '$state', '$window', 'monthResolve', 'RestsApi'];

  function MonthsController($scope, $state, $window, month, RestsApi) {
    var vm = this;
    vm.month = month;
    vm.form = {};
    vm.datas = [];
    vm.dates = [];
    vm.rests = [];
    vm.currentMonth = moment().year(vm.month.year).month(vm.month.month - 1);
    vm.createWorkDateBusy = false;

    onCreate();
    function onCreate() {
      prepareDates()
        .then(() => {
          return prepareRest();
        })
        .then(() => {
          console.log(vm.rests);
          return prepareShowingData();
        })
        .then(isChange => {
          if (isChange) {
            console.log('Save new timesheet');
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
            vm.rests = res;
            return resolve();
          })
          .error(err => {
            vm.rests = [];
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
          var work = _.findWhere(vm.month.workDates, { month: date.month(), date: date.date() });
          var rest = getRestByDate(date);
          if (work) {
            if (!work.rest && rest) {
              work.rest = rest;
              work.content = undefined;
              work.start = undefined;
              work.end = undefined;
              work.middleRest = undefined;
              work.transfer = undefined;
              isChange = true;
            }
          } else {
            if (rest) {
              work = {
                month: date.month(),
                date: date.date(),
                day: date.day(),
                rest: rest
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
      for (let index = 0; index < vm.rests.length; index++) {
        const rest = vm.rests[index];
        if (date.isBetween(moment(rest.start).format(), moment(rest.end).format(), null, '[]')) {
          return rest;
        }
      }
    }
    // Trở về màn hình trước
    vm.handlePreviousScreen = handlePreviousScreen;
    function handlePreviousScreen() {
      $state.go($state.previous.state.name || 'months.list', $state.previous.params);
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
