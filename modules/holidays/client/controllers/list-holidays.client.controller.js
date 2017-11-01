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

    // Add holiday
    vm.handleAddNewHoliday = () => {
      $scope.holiday = new HolidaysService();
      $scope.handleSaveHoliday = handleSaveHoliday;

      // Open dialog
      var mDialog = ngDialog.open({
        templateUrl: 'formHoliday.html',
        scope: $scope
      });
      mDialog.closePromise.then(function (res) {
        if (_.isUndefined(res.value)) return;
      });
    };
    // Edit holiday
    vm.handleEditHoliday = holiday => {
      $scope.holiday = _.clone(holiday);
      $scope.handleSaveHoliday = handleSaveHoliday;

      // Open dialog
      var mDialog = ngDialog.open({
        templateUrl: 'formHoliday.html',
        scope: $scope
      });
      mDialog.closePromise.then(function (res) {
        if (_.isUndefined(res.value)) return;
      });
    };
    // Save Holiday
    function handleSaveHoliday(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'holidayForm');
        return false;
      }

      if ($scope.holiday._id) {
        $scope.holiday.$update(successCallback, errorCallback);
      } else {
        $scope.holiday.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        var check = _.findWhere(vm.holidays, { _id: res._id });
        if (!check) {
          vm.holidays.push(res);
        } else {
          _.extend(check, res);
        }
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
