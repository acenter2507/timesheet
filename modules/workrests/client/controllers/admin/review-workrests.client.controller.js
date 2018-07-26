(function () {
  'use strict';

  angular
    .module('workrests.admin')
    .controller('WorkrestsReviewController', WorkrestsReviewController);

  WorkrestsReviewController.$inject = [
    '$scope',
    '$state',
    'WorkrestsService',
    'DateUtil',
    '$stateParams',
    'Notifications',
    'Socket',
    'WorkrestsAdminApi',
    'AdminUserService',
    'CommonService',
    '$q'
  ];

  function WorkrestsReviewController(
    $scope,
    $state,
    WorkrestsService,
    DateUtil,
    $stateParams,
    Notifications,
    Socket,
    WorkrestsAdminApi,
    AdminUserService,
    CommonService,
    $q
  ) {
    var vm = this;
    vm.workrests = [];
    vm.condition = {};

    vm.busy = false;
    vm.page = 1;
    vm.pages = [];
    vm.total = 0;
    vm.isShowHistory = false;
    vm.historys = [];

    onCreate();
    function onCreate() {
      prepareCondition();
      prepareParams();
      prepareNotification();
      // prepareCalendar();
      // prepareRestAction();
      handleSearch();
    }
    function prepareCondition() {
      vm.condition = {
        sort: '-created',
        limit: 10,
        users: []
      };
      vm.condition.status = ($stateParams.status) ? $stateParams.status : undefined;
      vm.condition.user = ($stateParams.user) ? $stateParams.user : undefined;
    }
    function prepareNotification() {
      if ($stateParams.notif) {
        Notifications.remove($stateParams.notif);
      }
    }
    function prepareParams() {
      if ($stateParams.user) {
        AdminUserService.get({ userId: $stateParams.user }).$promise.then(function (user) {
          var _user = _.pick(user, 'displayName', 'email', 'profileImageURL', '_id');
          vm.condition.users.push(_user);
          delete vm.condition.user;
        });
      }
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
      vm.handleCalendarEventClicked = function () {
        return false;
      };
      vm.handleCalendarRangeSelected = function (start, end) {
        return false;
      };
      vm.handleCalendarClicked = function (date) {
        return false;
      };
    }

    function prepareRestAction() {
      vm.action = {
        remove: {
          label: '<i class=\'fa fa-trash\'></i>',
          onClick: function (args) {
            var rest = _.findWhere(vm.workrests, { _id: args.calendarEvent.id });
            vm.handleDeleteRest(rest);
          }
        },
        edit: {
          label: '<i class=\'fa fa-pencil-square-o\'></i>',
          onClick: function (args) {
            $state.go('workrests.edit', { workrestId: args.calendarEvent.id });
          }
        },
        approve: {
          label: '<i class=\'fa fa-check-square-o\'></i>',
          onClick: function (args) {
            var rest = _.findWhere(vm.workrests, { _id: args.calendarEvent.id });
            vm.handleApproveRest(rest);
          }
        },
        reject: {
          label: '<i class=\'fa fa-minus-circle\'></i>',
          onClick: function (args) {
            var rest = _.findWhere(vm.workrests, { _id: args.calendarEvent.id });
            vm.handleRejectRest(rest);
          }
        }
      };
    }
    function prepareCalendarEvent() {
      vm.events = [];
      if (vm.workrests.length === 0) return;
      vm.workrests.forEach(function (rest) {
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
            // actions.push(vm.action.approve);
            // actions.push(vm.action.reject);
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
    vm.handleStartSearch = function () {
      vm.page = 1;
      handleSearch();
    };
    function handleSearch() {
      if (vm.busy) return;
      vm.busy = true;
      WorkrestsAdminApi.reviews(vm.condition, vm.page)
        .success(function (res) {
          vm.workrests = res.docs;
          vm.pages = res.pages;
          vm.total = res.total;
          // prepareCalendar();
          // prepareCalendarEvent();
          vm.busy = false;
        })
        .error(function (err) {
          $scope.handleShowToast(err.message, true);
          vm.busy = false;
        });
    }
    vm.handleClearCondition = function () {
      prepareCondition();
    };
    vm.handlePageChanged = function () {
      handleSearch();
    };
    vm.hanleSelectWorkrestOnCalendar = function (calendarEvent) {
      $state.go('admin.workrests.review', { workrestId: calendarEvent.id });
    };
    vm.hanleSelectWorkrest = function (workrest) {
      $state.go('admin.workrests.review', { workrestId: workrest._id });
    };
    vm.handleSearchUsers = function ($query) {
      if (CommonService.isStringEmpty($query)) {
        return [];
      }

      var deferred = $q.defer();
      CommonService.autocompleteUsers({ key: $query })
        .success(function (users) {
          deferred.resolve(users);
        });

      return deferred.promise;
    };
    vm.hanleSelectWorkrest = function (workrest) {
      $state.go('admin.workrests.review', { workrestId: workrest._id });
    };
    vm.handleApproveWorkrest = function (workrest) {
      $scope.handleShowConfirm({
        message: 'この休暇を承認しますか？'
      }, function () {
        WorkrestsAdminApi.approve(workrest._id)
          .success(function (data) {
            _.extend(workrest, data);
            Socket.emit('rest_review', { workrestId: workrest._id, user: $scope.user._id });
          })
          .error(function (err) {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    vm.handleRejectWorkrest = function (workrest) {
      $scope.handleShowConfirm({
        message: 'この休暇を拒否しますか？'
      }, function () {
        WorkrestsAdminApi.reject(workrest._id)
          .success(function (data) {
            _.extend(workrest, data);
          })
          .error(function (err) {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    vm.handleDeleteWorkrest = function (workrest) {
      $scope.handleShowConfirm({
        message: '休暇を取り消しますか？'
      }, function () {
        var rsRest = new WorkrestsService({ _id: workrest._id });
        rsRest.$remove(function () {
          vm.workrests = _.without(vm.workrests, workrest);
          vm.total -= 1;
        });
      });
    };
    vm.handleViewHistory = function (rest) {
      vm.isShowHistory = true;
      vm.historys = rest.historys;
    };
  }
}());
