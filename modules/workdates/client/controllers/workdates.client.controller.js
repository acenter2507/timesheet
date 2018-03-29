(function () {
  'use strict';

  // Workdates controller
  angular
    .module('workdates')
    .controller('WorkdatesController', WorkdatesController);

  WorkdatesController.$inject = ['$scope', '$state', '$window', 'Authentication', 'workdateResolve'];

  function WorkdatesController($scope, $state, $window, Authentication, workdate) {
    var vm = this;

    vm.workdate = workdate;
    console.log(vm.workdate);
    vm.date = moment().year(vm.workdate.workmonth.year).month(vm.workdate.month - 1).date(vm.workdate.date);

    vm.handlePreviousScreen = handlePreviousScreen;
    function handlePreviousScreen() {
      var state = $state.previous.state.name || 'workmonths.view';
      var params = state === 'workmonths.view' ? { workmonthId: vm.workdate.workmonth._id } : $state.previous.params;
      $state.go(state, params);
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
