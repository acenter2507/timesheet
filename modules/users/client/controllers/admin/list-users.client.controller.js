'use strict';

angular.module('users.admin').controller('UserListController', [
  '$scope',
  '$filter',
  'AdminUserApi',
  function($scope, $filter, AdminUserApi) {
    var vm = this;

    vm.manager = { page: 1 };
    vm.member = { page: 1 };
    vm.admin = { page: 1 };
    onCreate();

    function onCreate() {
      handleLoadManagerUsers();
      handleLoadMemberUsers();
      handleLoadAdminUsers();
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

    vm.handleChangeManagerPage = page => {
      vm.manager.page = page;
      handleLoadManagerUsers();
    };
    vm.handleChangeMemberPage = page => {
      vm.member.page = page;
      handleLoadMemberUsers();
    };
    vm.handleChangeAdminPage = page => {
      vm.admin.page = page;
      handleLoadAdminUsers();
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
