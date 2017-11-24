(function () {
  'use strict';

  angular
    .module('rests')
    .controller('RestsReviewController', RestsReviewController);

  RestsReviewController.$inject = ['$scope', '$state', 'RestsService', 'CommonService', 'DateUtil', 'RestsApi', 'DepartmentsService', 'ngDialog', '$document'];

  function RestsReviewController($scope, $state, RestsService, CommonService, DateUtil, RestsApi, DepartmentsService, ngDialog, $document) {
    var vm = this;
    vm.busy = false;
    vm.page = 1;
    vm.pages = [];
    vm.total = 0;
    vm.isShowHistory = false;
    vm.historys = [];
    vm.historyBox = angular.element(document.getElementById('rests-review-historys'));
    vm.restsBox = angular.element(document.getElementById('rests-review-rests'));
    vm.toolsBox = angular.element(document.getElementById('rests-review-tools'));
    vm.calendarBox = angular.element(document.getElementById('rests-review-calendar'));

    onCreate();
    function onCreate() {
      prepareCalendar();
      prepareRestAction();
      prepareDepartments();
      prepareCondition();
      handleSearch();
    }
    function prepareCalendar() {
      vm.calendar = { view: 'month' };
      vm.calendar.viewDate = moment().startOf('month').toDate();
      vm.calendar.cellModifier = function (cell) {
        // cell.cssClass = 'odd-cell';
        var date = cell.date.format('YYYY/MM/DD');

        // 週末チェック
        if (DateUtil.isWeekend(cell.date)) {
          return;
        }

        // 祝日チェック
        var offdate = JapaneseHolidays.isHoliday(new Date(date));
        if (offdate) {
          cell.cssClass = 'off-cell';
          return;
        }

        // 選択された範囲チェック
        // if (cell.date.isBetween(vm.rest.start, vm.rest.end, null, '[]')) {
        //   cell.cssClass = 'selected-cell';
        //   return;
        // }
      };
    }
    function prepareRestAction() {
      vm.action = {
        remove: {
          label: '<i class=\'fa fa-trash\'></i>',
          onClick: function (args) {
            var rest = _.findWhere(vm.rests, { _id: args.calendarEvent.id });
            vm.handleDeleteRest(rest);
          }
        },
        edit: {
          label: '<i class=\'fa fa-pencil-square-o\'></i>',
          onClick: function (args) {
            $state.go('rests.edit', { restId: args.calendarEvent.id });
          }
        },
        approve: {
          label: '<i class=\'fa fa-check-square-o\'></i>',
          onClick: function (args) {
            var rest = _.findWhere(vm.rests, { _id: args.calendarEvent.id });
            vm.handleApproveRest(rest);
          }
        },
        reject: {
          label: '<i class=\'fa fa-minus-circle\'></i>',
          onClick: function (args) {
            var rest = _.findWhere(vm.rests, { _id: args.calendarEvent.id });
            vm.handleRejectRest(rest);
          }
        }
      };
    }
    function prepareDepartments() {
      DepartmentsService.query().$promise.then(data => {
        vm.departments = data;
      });
    }
    function prepareCondition() {
      vm.condition = {
        sort: '-created',
        limit: 20
      };
    }
    function prepareCalendarEvent() {
      vm.events = [];
      if (vm.rests.length === 0) return;
      vm.rests.forEach(rest => {
        var color;
        var actions = [];
        switch (rest.status) {
          case 1: { // Not send
            color = undefined;
            color = { primary: '#777', secondary: '#e3e3e3' };
            break;
          }
          case 2: { // Waiting
            color = { primary: '#f0ad4e', secondary: '#fae6c9' };
            actions.push(vm.action.approve);
            actions.push(vm.action.reject);
            break;
          }
          case 3: { // Approved
            color = { primary: '#5cb85c', secondary: '#bde2bd' };
            break;
          }
          case 4: { // Rejected
            color = { primary: '#d9534f', secondary: '#fae3e3' };
            break;
          }
          case 5: { // Done
            color = { primary: '#337ab7', secondary: '#D1E8FF' };
            break;
          }
        }
        vm.events.push({
          id: rest._id.toString(),
          title: rest.user.displayName + '・' + rest.holiday.name,
          color: color,
          startsAt: moment(rest.start).toDate(),
          endsAt: moment(rest.end).toDate(),
          actions: actions
        });
      });
    }
    vm.handleStartSearch = () => {
      vm.page = 1;
      handleSearch();
    };
    function handleSearch() {
      if (vm.busy) return;
      vm.busy = true;
      RestsApi.getRestReview(vm.condition, vm.page)
        .success(res => {
          vm.rests = res.docs;
          vm.pages = CommonService.createArrayFromRange(res.pages);
          vm.total = res.total;
          prepareCalendar();
          prepareCalendarEvent();
          vm.busy = false;
        })
        .error(err => {
          $scope.handleShowToast(err.message, true);
          vm.busy = false;
        });
    }
    vm.handleClearCondition = () => {
      prepareCondition();
    };
    vm.handlePageChanged = page => {
      vm.page = page;
      handleSearch();
    };
    vm.handleCalendarEventClicked = () => {
      return false;
    };
    vm.handleCalendarRangeSelected = (start, end) => {
      return false;
    };
    vm.handleCalendarClicked = date => {
      return false;
    };
    vm.handleRestClicked = calendarEvent => {
      $state.go('rests.view', { restId: calendarEvent.id });
    };
    vm.handleApproveRest = rest => {
      $scope.handleShowConfirm({
        message: 'この休暇を承認しますか？'
      }, () => {
        RestsApi.approve(rest._id)
          .success(data => {
            _.extend(rest, data);
          })
          .error(err => {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    vm.handleRejectRest = rest => {
      ngDialog.openConfirm({
        templateUrl: 'commentTemplate.html',
        scope: $scope
      }).then(comment => {
        delete $scope.comment;
        $scope.handleShowConfirm({
          message: 'この休暇を拒否しますか？'
        }, () => {
          RestsApi.reject(rest._id, { comment: comment })
            .success(data => {
              _.extend(rest, data);
            })
            .error(err => {
              $scope.handleShowToast(err.message, true);
            });
        });
      }, () => {
        delete $scope.comment;
      });

    };
    vm.handleViewHistory = rest => {
      vm.isShowHistory = true;
      vm.historys = rest.historys;
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
  }
}());
