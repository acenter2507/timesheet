(function () {
  'use strict';

  angular
    .module('workmonths.admin')
    .controller('WorkmonthsReviewController', WorkmonthsReviewController);

  WorkmonthsReviewController.$inject = [
    'WorkmonthsService',
    '$scope',
    '$state',
    'CommonService',
    '$stateParams',
    'WorkmonthsAdminApi',
    'AdminUserService',
    '$q'];

  function WorkmonthsReviewController(
    WorkmonthsService,
    $scope,
    $state,
    CommonService,
    $stateParams,
    WorkmonthsAdminApi,
    AdminUserService,
    $q) {
    var vm = this;
    vm.workmonths = [];
    vm.condition = {};

    vm.busy = false;
    vm.page = 1;
    vm.pages = 0;
    vm.total = 0;
    vm.historys = [];

    onCreate();
    function onCreate() {
      prepareCondition();
      prepareParams();
      handleSearch();
    }
    function prepareCondition() {
      vm.condition = {
        sort: '-created',
        limit: 20,
        users: []
      };
      vm.condition.status = ($stateParams.status) ? $stateParams.status : undefined;
      vm.condition.user = ($stateParams.user) ? $stateParams.user : undefined;
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
    function handleSearch() {
      if (vm.busy) return;
      vm.busy = true;
      WorkmonthsAdminApi.reviews(vm.condition, vm.page)
        .success(function (res) {
          vm.workmonths = res.docs;
          vm.pages = res.pages;
          vm.total = res.total;
          vm.busy = false;
        })
        .error(function (err) {
          $scope.handleShowToast(err.message, true);
          vm.busy = false;
        });
    }

    vm.handleStartSearch = function () {
      vm.page = 1;
      handleSearch();
    };
    vm.handlePageChanged = function () {
      handleSearch();
    };
    vm.handleClearCondition = function () {
      prepareCondition();
    };
    vm.handleSearchUsers = function ($query) {
      if (CommonService.isStringEmpty($query)) {
        return [];
      }

      var deferred = $q.defer();
      CommonService.autocompleteUsers({ key: $query, department: false })
        .success(function (users) {
          deferred.resolve(users);
        });

      return deferred.promise;
    };
    vm.handleViewHistory = function (workmonth) {
      vm.isShowHistory = true;
      vm.historys = workmonth.historys;
    };
    vm.handleCloseHistory = function () {
      vm.isShowHistory = false;
      vm.historys = [];
    };
    vm.hanleSelectWorkmonth = function (workmonth) {
      $state.go('admin.workmonths.review', { workmonthId: workmonth._id });
    };
    vm.handleApproveWorkmonth = function (workmonth) {
      $scope.handleShowConfirm({
        message: 'この勤務表を承認しますか？'
      }, function () {
        WorkmonthsAdminApi.approve(workmonth._id)
          .success(function (_workmonth) {
            _.extend(workmonth, _workmonth);
          })
          .error(function (err) {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    vm.handleRejectWorkmonth = function (workmonth) {
      $scope.handleShowConfirm({
        message: 'この勤務表を拒否しますか？'
      }, function () {
        WorkmonthsAdminApi.reject(workmonth._id)
          .success(function (_workmonth) {
            _.extend(workmonth, _workmonth);
          })
          .error(function (err) {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    vm.handleDeleteWorkmonth = function (workmonth) {
      $scope.handleShowConfirm({
        message: '勤務表を削除しますか？'
      }, function () {
        var rsWorkmonth = new WorkmonthsService({ _id: workmonth._id });
        rsWorkmonth.$remove(function () {
          vm.workmonths = _.without(vm.workmonths, workmonth);
          vm.total -= 1;
        });
      });
    };
  }
}());
