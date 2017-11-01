(function () {
  'use strict';

  angular
    .module('holidays')
    .controller('HolidaysListController', HolidaysListController);

  HolidaysListController.$inject = [
    '$scope',
    'HolidaysService',
    'ngDialog'
  ];

  function HolidaysListController($scope, HolidaysService, ngDialog) {
    var vm = this;
    vm.holidays = HolidaysService.query();

    vm.handleAddNewHoliday = () => {
      $scope.holiday = new HolidaysService();
      $scope.handleSaveHoliday = handleSaveHoliday;

      // Open dialog
      var mDialog = ngDialog.open({
        templateUrl: 'formHoliday.html',
        scope: $scope
      });
      mDialog.closePromise.then(function (res) {
        if (_.isUndefined(res.value) ) return;
      });
    }
    vm.handleEditHoliday = holiday => {
      $scope.holiday = holiday;
      $scope.handleSaveHoliday = handleSaveHoliday;

      // Open dialog
      var mDialog = ngDialog.open({
        templateUrl: 'formHoliday.html',
        scope: $scope
      });
      mDialog.closePromise.then(function (res) {
        if (_.isUndefined(res.value) ) return;
      });
    };

    // Save Holiday
    function handleSaveHoliday(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'holidayForm');
        return false;
      }

      // TODO: move create/update logic to service
      if ($scope.holiday._id) {
        $scope.holiday.$update(successCallback, errorCallback);
      } else {
        $scope.holiday.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        vm.holidays.push(res);
        $scope.handleShowToast('休日形態を保存しました', false);
        delete $scope.holiday;
      }

      function errorCallback(res) {
        $scope.handleShowToast('休日形態を保存できません', true);
        delete $scope.holiday;
      }
    }
  }
}());
