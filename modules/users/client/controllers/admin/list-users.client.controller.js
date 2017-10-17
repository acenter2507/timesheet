'use strict';

angular.module('users.admin').controller('UserListController', [
  '$scope',
  '$state',
  '$filter',
  'AdminUserApi',
  'AdminUserService',
  'CommonService',
  function ($scope, $state, $filter, AdminUserApi, AdminUserService, CommonService) {
    var vm = this;

    onCreate();

    function onCreate() {
      vm.manager = { page: 1 };
      vm.member = { page: 1 };
      handleLoadManagerUsers();
      handleLoadMemberUsers();
      if ($scope.isAdmin) {
        vm.admin = { page: 1 };
        vm.deleted = { page: 1 };
        handleLoadAdminUsers();
        handleLoadDeletedUsers();
      }
    }

    function handleLoadManagerUsers() {
      AdminUserApi.loadUsers({ roles: 'manager' }, vm.manager.page)
        .success(res => {
          vm.manager.data = res.docs;
          vm.manager.pages = createArrayFromRange(res.pages);
          vm.manager.total = res.total;
        })
        .error(err => {
          $scope.handleShowToast(err.message, true);
        });
    }
    function handleLoadMemberUsers() {
      AdminUserApi.loadUsers({ roles: ['user', 'accountant'] }, vm.member.page)
        .success(res => {
          vm.member.data = res.docs;
          vm.member.pages = createArrayFromRange(res.pages);
          vm.member.total = res.total;
        })
        .error(err => {
          $scope.handleShowToast(err.message, true);
        });
    }
    function handleLoadAdminUsers() {
      AdminUserApi.loadUsers({ roles: 'admin' }, vm.admin.page)
        .success(res => {
          vm.admin.data = res.docs;
          vm.admin.pages = createArrayFromRange(res.pages);
          vm.admin.total = res.total;
        })
        .error(err => {
          $scope.handleShowToast(err.message, true);
        });
    }
    function handleLoadDeletedUsers() {
      AdminUserApi.loadUsers({ mode: 'deleted' }, vm.deleted.page)
        .success(res => {
          vm.deleted.data = res.docs;
          vm.deleted.pages = createArrayFromRange(res.pages);
          vm.deleted.total = res.total;
        })
        .error(err => {
          $scope.handleShowToast(err.message, true);
        });
    }

    vm.handleChangeManagerPage = page => {
      if (vm.manager.page === page) return;
      vm.manager.page = page;
      handleLoadManagerUsers();
    };
    vm.handleChangeMemberPage = page => {
      if (vm.member.page === page) return;
      vm.member.page = page;
      handleLoadMemberUsers();
    };
    vm.handleChangeAdminPage = page => {
      if (vm.admin.page === page) return;
      vm.admin.page = page;
      handleLoadAdminUsers();
    };
    vm.handleChangeDeletedPage = page => {
      if (vm.deleted.page === page) return;
      vm.deleted.page = page;
      handleLoadDeletedUsers();
    };
    // View detail user
    vm.handleViewDetailUser = user => {
      if ($scope.isAdmin || $scope.isAccountant) {
        return $state.go('users.view', { userId: user._id });
      } else {
        return $state.go('profile.view', { userId: user._id });
      }
    };
    // Gửi message đến toàn bộ user trong 1 group
    vm.sendMessageAll = group => {
      $scope.handleShowToast('只今、この機能は作成中です。');
    };
    vm.handleSendMessageUser = user => {
      $scope.handleShowToast('只今、この機能は作成中です。');
    };
    vm.handleLogicDeleteUser = user => {
      $scope.handleShowConfirm({
        message: user.displayName + 'を削除しますか？'
      }, () => {
        var rsUser = new AdminUserService({ _id: user._id });
        rsUser.status = 3;
        rsUser.$update(() => {
          if ($scope.isAdmin) {
            vm.deleted.page = 1;
            handleLoadDeletedUsers();
          }
        });
        if (CommonService.checkUserIsAdmin(user.roles)) {
          vm.admin.data = _.without(vm.admin.data, user);
        } else if (CommonService.checkUserIsManager(user.roles)) {
          vm.manager.data = _.without(vm.manager.data, user);
        } else {
          vm.member.data = _.without(vm.member.data, user);
        }
      });
    };
    // Phục hồi user sau khi bị xóa
    vm.handleResetUser = user => {
      $scope.handleShowConfirm({
        message: user.displayName + 'を復元しますか？'
      }, () => {
        var rsUser = new AdminUserService({ _id: user._id });
        rsUser.status = 1;
        rsUser.$update(() => {
          if (CommonService.checkUserIsAdmin(user.roles)) {
            vm.admin.page = 1;
            handleLoadAdminUsers();
          } else if (CommonService.checkUserIsManager(user.roles)) {
            vm.manager.page = 1;
            handleLoadManagerUsers();
          } else {
            vm.member.page = 1;
            handleLoadMemberUsers();
          }
        });
        vm.deleted.data = _.without(vm.deleted.data, user);
      });
    };
    vm.handleDatabaseDeleteUser = user => {
      $scope.handleShowConfirm({
        message: user.displayName + 'を完全削除しますか？'
      }, () => {
        var rsUser = new AdminUserService({ _id: user._id });
        rsUser.$remove();
        if (user.status === 3) {
          vm.deleted.data = _.without(vm.deleted.data, user);
          return;
        }
        if (CommonService.checkUserIsAdmin(user.roles)) {
          vm.admin.data = _.without(vm.admin.data, user);
        } else if (CommonService.checkUserIsManager(user.roles)) {
          vm.manager.data = _.without(vm.manager.data, user);
        } else {
          vm.member.data = _.without(vm.member.data, user);
        }
      });
    };
    vm.handleDatabaseClearAll = () => {
      $scope.handleShowConfirm({
        message: '全ての削除されたアカウントを削除しますか？'
      }, () => {
        AdminUserApi.clearDeletedUsers()
          .success(() => { delete vm.deleted; });
      });
    };

    function createArrayFromRange(range) {
      var array = [];
      for (var i = 1; i <= range; i++) {
        array.push(i);
      }
      return array;
    }
  }
]);
