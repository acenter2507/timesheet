(function () {
  'use strict';

  angular
    .module('workmonths')
    .controller('WorkmonthsListController', WorkmonthsListController);

  WorkmonthsListController.$inject = ['WorkmonthsService', '$scope', '$state', 'DateUtil', '$stateParams', 'CommonService', 'WorkmonthsApi'];

  function WorkmonthsListController(WorkmonthsService, $scope, $state, DateUtil, $stateParams, CommonService, WorkmonthsApi) {
    var vm = this;
    vm.createMonthBusy = false;
    vm.isShowHistory = false;

    vm.workmonths = [];

    onCreate();
    function onCreate() {
      prepareParams();
      prepareMonths();
    }

    function prepareParams() {
      var param = $stateParams.year;
      if (param) {
        vm.currentYear = moment(param, 'YYYY');
      } else {
        vm.currentYear = moment();
      }
    }
    function prepareMonths() {
      WorkmonthsApi.getWorkMonthsByYearAndUser(vm.currentYear.year(), $scope.user._id)
        .success(res => {
          prepareShowingData(res);
        })
        .error(err => {
          $scope.handleShowToast(err.message, true);
        });
    }
    function prepareShowingData(datas) {
      for (var index = 1; index <= 12; index++) {
        var workmonth = _.findWhere(datas, { month: index });
        vm.workmonths.push({ index: index, workmonth: workmonth });
      }
    }

    vm.handleNextYear = () => {
      var lastYear = vm.currentYear.clone().subtract(1, 'years');
      $state.go('workmonths.list', { year: lastYear.year() });
    };
    vm.handlePreviousYear = () => {
      var nextYear = vm.currentYear.clone().add(1, 'years');
      $state.go('workmonths.list', { year: nextYear.year() });
    };
    vm.handleCurrentYear = () => {
      var current = moment(new Date(), 'YYYY');
      $state.go('workmonths.list', { year: current.year() });
    };
    vm.handleCreateWorkMonth = index => {
      if (vm.createMonthBusy) return;
      vm.createMonthBusy = true;

      var newMonth = new WorkmonthsService({
        year: vm.currentYear.year(),
        month: index
      });
      newMonth.$save(res => {
        vm.createMonthBusy = false;
        var oldMonth = _.findWhere(vm.workmonths, { index: index });
        _.extend(oldMonth, { workmonth: res });
      }, err => {
        $scope.handleShowToast(err.data.message, true);
        vm.createMonthBusy = false;
      });
    };
    vm.handleSendRequestWorkmonth = item => {
      $scope.handleShowConfirm({
        message: item.workmonth.month + '月の勤務表を申請しますか？'
      }, () => {
        WorkmonthsApi.request(item.workmonth._id)
          .success(data => {
            _.extend(item.workmonth, data);
            Socket.emit('month_request', { workmonthId: item.workmonth._id, userId: $scope.user._id });
          })
          .error(err => {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    vm.handleDeleteWorkmonth = item => {
      if (!item.workmonth) return;
      $scope.handleShowConfirm({
        message: item.workmonth.month + '月の勤務表を削除しますか？'
      }, () => {
        var rsMonth = new WorkmonthsService({ _id: item.workmonth._id });
        rsMonth.$remove(() => {
          item.workmonth = undefined;
        });
      });
    };
    vm.handleViewHistory = item => {
      vm.isShowHistory = true;
      vm.historys = item.workmonth.historys;
    };
    vm.handleCloseHistory = () => {
      vm.isShowHistory = false;
    };
    // View user detail page
    vm.handleViewDetailUser = user => {
      if ($scope.isAdmin || $scope.isAccountant) {
        return $state.go('users.view', { userId: user._id });
      } else {
        return $state.go('profile.view', { userId: user._id });
      }
    };
    vm.handleCreateAll = () => {
      if (vm.createMonthBusy) return;
      $scope.handleShowConfirm({
        message: '今年月の勤務表を全て作成しますか？'
      }, () => {
        var undefineds = [];
        vm.workmonths.forEach(item => {
          if (!item.workmonth)
            return undefineds.push(item.index);
        });
        if (undefineds.length === 0) return $scope.handleShowToast('今年の勤務表は全部作成されました。', true);
        vm.createMonthBusy = true;
        var promises = [];
        for (let i = 0; i < undefineds.length; i++) {
          var index = undefineds[i];
          var newMonth = new WorkmonthsService({
            year: vm.currentYear.year(),
            month: index
          });
          promises.push(newMonth.$save());
        }
        Promise.all(promises)
          .then(res => {
            for (let i = 0; i < undefineds.length; i++) {
              var index = undefineds[i];
              var newMonth = _.findWhere(res, { month: index });
              var oldItem = _.findWhere(vm.workmonths, { index: index });
              if (newMonth && oldItem) {
                _.extend(oldItem, { workmonth: newMonth });
              }
            }
            vm.createMonthBusy = false;
          })
          .catch(err => {
            $scope.handleShowToast(err.data.message, true);
            vm.createMonthBusy = false;
          });
      });
    };
  }
}());
