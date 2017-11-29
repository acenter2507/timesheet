(function () {
  'use strict';

  // Months controller
  angular
    .module('months')
    .controller('MonthsController', MonthsController);

  MonthsController.$inject = ['$scope', '$state', '$window', 'monthResolve'];

  function MonthsController($scope, $state, $window, month) {
    var vm = this;
    vm.month = month;
    vm.datas = [];
    vm.dates = [];
    vm.currentMonth = moment().year(vm.month.year).month(vm.month.month - 1);

    onCreate();
    function onCreate() {
      prepareDates();
      prepareShowingData();
    }

    function prepareDates() {
      vm.startDate = moment(vm.currentMonth).subtract(1, 'months').date(21);
      vm.endDate = moment(vm.currentMonth).date(20);
      var durration = vm.endDate.diff(vm.startDate, 'days');
      for (var index = 0; index <= durration; index++) {
        var item = vm.startDate.clone().add(index, 'days');
        vm.dates.push(item);
      }
    }
    function prepareShowingData() {
      for (var index = 0; index < vm.dates.length; index++) {
        var date = vm.dates[index];
        console.log(date.month() + ' - ' + date.date());
        var work = _.findWhere(vm.month.workDates, { month: date.month(), date: date.date() });
        vm.datas.push({ date: date, work: work });
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
