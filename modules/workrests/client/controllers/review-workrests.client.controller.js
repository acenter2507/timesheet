(function () {
  'use strict';

  angular
    .module('workrests')
    .controller('WorkrestsReviewController', WorkrestsReviewController);

  WorkrestsReviewController.$inject = ['$scope', '$state', 'WorkrestsService', 'CommonService', 'DateUtil', 'WorkrestsApi', 'DepartmentsService', 'ngDialog', '$document', '$stateParams', 'Notifications', 'Socket'];

  function WorkrestsReviewController($scope, $state, WorkrestsService, CommonService, DateUtil, WorkrestsApi, DepartmentsService, ngDialog, $document, $stateParams, Notifications, Socket) {
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
      prepareNotification();
      prepareCalendar();
      prepareRestAction();
      prepareDepartments();
      prepareCondition();
      handleSearch();
    }
    function prepareNotification() {
      if ($stateParams.notif) {
        Notifications.remove($stateParams.notif);
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
      vm.condition.status = ($stateParams.status) ? $stateParams.status : 2;
    }
    function prepareCalendarEvent() {
      vm.events = [];
      if (vm.workrests.length === 0) return;
      vm.workrests.forEach(rest => {
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
      WorkrestsApi.getRestReview(vm.condition, vm.page)
        .success(res => {
          vm.workrests = res.docs;
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
      $state.go('workrests.view', { workrestId: calendarEvent.id });
    };
    // Chấp nhận ngày nghỉ
    vm.handleApproveRest = workrest => {
      $scope.handleShowConfirm({
        message: 'この休暇を承認しますか？'
      }, () => {
        WorkrestsApi.verify(workrest._id)
          .then(res => {
            var result = res.data;
            if (result.problem && !result.confirm) {
              $scope.handleShowToast(result.warnings[0], true);
              return;
            }

            if (result.problem && result.confirm) {
              var message = result.warnings[0];
              for (let index = 1; index < result.warnings; index++) {
                message += '<br>' + result.warnings[index];
              }
              message += '<br>' + '休暇を承認しますか？';
              $scope.handleShowConfirm({
                message: message
              }, () => {
                WorkrestsApi.approve(workrest._id)
                  .success(data => {
                    _.extend(workrest, data);
                    Socket.emit('rest_review', { workrestId: workrest._id, user: $scope.user._id });
                  })
                  .error(err => {
                    $scope.handleShowToast(err.message, true);
                  });
              });
              return;
            }

            WorkrestsApi.approve(workrest._id)
              .success(data => {
                _.extend(workrest, data);
                Socket.emit('rest_review', { workrestId: workrest._id, user: $scope.user._id });
              })
              .error(err => {
                $scope.handleShowToast(err.message, true);
              });

          })
          .catch(err => {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    // Không chấp nhận ngày nghỉ
    vm.handleRejectRest = workrest => {
      ngDialog.openConfirm({
        templateUrl: 'commentTemplate.html',
        scope: $scope
      }).then(comment => {
        delete $scope.comment;
        $scope.handleShowConfirm({
          message: 'この休暇を拒否しますか？'
        }, () => {
          WorkrestsApi.reject(workrest._id, { comment: comment })
            .success(data => {
              _.extend(workrest, data);
              Socket.emit('rest_review', { workrestId: workrest._id, user: $scope.user._id });
            })
            .error(err => {
              $scope.handleShowToast(err.message, true);
            });
        });
      }, () => {
        delete $scope.comment;
      });

    };
    // Xóa ngày nghỉ theo thỉnh cầu
    vm.handleDelete = workrest => {
      $scope.handleShowConfirm({
        message: '削除しますか？'
      }, () => {
        var rsRest = new WorkrestsService({ _id: workrest._id });
        rsRest.$remove(() => {
          vm.workrests = _.without(vm.workrests, workrest);
        });
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
