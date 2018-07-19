(function () {
  'use strict';

  angular
    .module('holidays.admin')
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
    vm.handleAddNewHoliday = function () {
      $scope.holiday = new HolidaysService();
      $scope.handleSaveHoliday = handleSaveHoliday;

      // Open dialog
      $scope.mDialog = ngDialog.open({
        templateUrl: 'formHoliday.html',
        scope: $scope,
        showClose: false
      });
      $scope.mDialog.closePromise.then(function (res) {
        if (_.isUndefined(res.value)) return;
      });
    };
    // Edit holiday
    vm.handleEditHoliday = function (holiday) {
      $scope.holiday = _.clone(holiday);
      $scope.handleSaveHoliday = handleSaveHoliday;

      // Open dialog
      $scope.mDialog = ngDialog.open({
        templateUrl: 'formHoliday.html',
        scope: $scope,
        showClose: false
      });
      $scope.mDialog.closePromise.then(function (res) {
        delete $scope.holiday;
        delete $scope.handleSaveHoliday;
      });
    };
    // Delete holida
    vm.handleDeleteHoliday = function (holiday) {
      $scope.handleShowConfirm({
        message: '' + holiday.name + 'を削除しますか？'
      }, function () {
        vm.holidays = _.without(vm.holidays, holiday);
        holiday.$remove();
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
        $scope.mDialog.close();
      }

      function errorCallback(res) {
        $scope.handleShowToast('休日形態を保存できません', true);
      }
    }
  }
}());
