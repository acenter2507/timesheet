'use strict';

angular
  .module('users.admin')
  .controller('UserListController', UserListController);

UserListController.$inject = [
  '$scope',
  '$state',
  '$filter',
  'AdminUserApi',
  'AdminUserService',
  'CommonService',
  'DepartmentsApi',
  'DepartmentsService',
  '$stateParams',
  'UserRolesService',
  '$q'
];

function UserListController(
  $scope,
  $state,
  $filter,
  AdminUserApi,
  AdminUserService,
  CommonService,
  DepartmentsApi,
  DepartmentsService,
  $stateParams,
  UserRolesService,
  $q
) {
  var vm = this;
  vm.users = [];
  vm.departments = [];
  vm.condition = {};

  onCreate();
  function onCreate() {
    prepareDepartments();
    prepareCondition();
    prepareParams();

    // vm.manager = { page: 1 };
    // vm.member = { page: 1 };
    // handleLoadManagerUsers();
    // handleLoadMemberUsers();
    // if ($scope.isAdmin) {
    //   vm.admin = { page: 1 };
    //   vm.deleted = { page: 1 };
    //   handleLoadAdminUsers();
    //   handleLoadDeletedUsers();
    // }
  }

  function prepareDepartments() {
    DepartmentsService.query().$promise.then(function (departments) {
      vm.departments = departments;
    });
  }
  function prepareCondition() {
    vm.condition = {
      sort: '-created',
      limit: 10,
      roles: []
    };
    vm.condition.status = ($stateParams.status) ? $stateParams.status : undefined;
    vm.condition.role = ($stateParams.role) ? $stateParams.role : undefined;
  }
  function prepareParams() {
    if ($stateParams.role) {
      vm.condition.roles.push(UserRolesService.getRole($stateParams.role));
      delete vm.condition.role;
    }
  }

  vm.handleSearchRoles = function() {
    var deferred = $q.defer();
    deferred.resolve(UserRolesService.roles);
    return deferred.promise;
  };














  // function handleLoadManagerUsers() {
  //   AdminUserApi.loadUsers({ roles: 'manager' }, vm.manager.page)
  //     .success(function (res) {
  //       vm.manager.data = res.docs;
  //       vm.manager.pages = createArrayFromRange(res.pages);
  //       vm.manager.total = res.total;
  //     })
  //     .error(function (err) {
  //       $scope.handleShowToast(err.message, true);
  //     });
  // }
  // function handleLoadMemberUsers() {
  //   AdminUserApi.loadUsers({ roles: ['user', 'accountant'] }, vm.member.page)
  //     .success(function (res) {
  //       vm.member.data = res.docs;
  //       vm.member.pages = createArrayFromRange(res.pages);
  //       vm.member.total = res.total;
  //     })
  //     .error(function (err) {
  //       $scope.handleShowToast(err.message, true);
  //     });
  // }
  // function handleLoadAdminUsers() {
  //   AdminUserApi.loadUsers({ roles: 'admin' }, vm.admin.page)
  //     .success(function (res) {
  //       vm.admin.data = res.docs;
  //       vm.admin.pages = createArrayFromRange(res.pages);
  //       vm.admin.total = res.total;
  //     })
  //     .error(function (err) {
  //       $scope.handleShowToast(err.message, true);
  //     });
  // }
  // function handleLoadDeletedUsers() {
  //   AdminUserApi.loadUsers({ mode: 'deleted' }, vm.deleted.page)
  //     .success(function (res) {
  //       vm.deleted.data = res.docs;
  //       vm.deleted.pages = createArrayFromRange(res.pages);
  //       vm.deleted.total = res.total;
  //     })
  //     .error(function (err) {
  //       $scope.handleShowToast(err.message, true);
  //     });
  // }

  // vm.handleChangeManagerPage = function (page) {
  //   if (vm.manager.page === page) return;
  //   vm.manager.page = page;
  //   handleLoadManagerUsers();
  // };
  // vm.handleChangeMemberPage = function (page) {
  //   if (vm.member.page === page) return;
  //   vm.member.page = page;
  //   handleLoadMemberUsers();
  // };
  // vm.handleChangeAdminPage = function (page) {
  //   if (vm.admin.page === page) return;
  //   vm.admin.page = page;
  //   handleLoadAdminUsers();
  // };
  // vm.handleChangeDeletedPage = function (page) {
  //   if (vm.deleted.page === page) return;
  //   vm.deleted.page = page;
  //   handleLoadDeletedUsers();
  // };
  // // Gửi message đến toàn bộ user trong 1 group
  // vm.sendMessageAll = function (group) {
  //   $scope.handleShowToast('只今、この機能は作成中です。');
  // };
  // vm.handleSendMessageUser = function (user) {
  //   $scope.handleShowToast('只今、この機能は作成中です。');
  // };
  // vm.handleLogicDeleteUser = function (user) {
  //   $scope.handleShowConfirm({
  //     message: user.displayName + 'を削除しますか？'
  //   }, function () {
  //     var rsUser = new AdminUserService({ _id: user._id });
  //     rsUser.status = 3;
  //     rsUser.$update(function () {
  //       if ($scope.isAdmin) {
  //         vm.deleted.page = 1;
  //         handleLoadDeletedUsers();
  //         if (user.department) {
  //           DepartmentsApi.removeUser(user.department._id, user._id);
  //         }
  //       }
  //     });
  //     if (CommonService.isAdmin(user.roles)) {
  //       vm.admin.data = _.without(vm.admin.data, user);
  //     } else if (CommonService.isManager(user.roles)) {
  //       vm.manager.data = _.without(vm.manager.data, user);
  //     } else {
  //       vm.member.data = _.without(vm.member.data, user);
  //     }
  //   });
  // };
  // // Phục hồi user sau khi bị xóa
  // vm.handleResetUser = function (user) {
  //   $scope.handleShowConfirm({
  //     message: user.displayName + 'を復元しますか？'
  //   }, function () {
  //     var rsUser = new AdminUserService({ _id: user._id });
  //     rsUser.status = 1;
  //     rsUser.$update(function () {
  //       if (CommonService.isAdmin(user.roles)) {
  //         vm.admin.page = 1;
  //         handleLoadAdminUsers();
  //       } else if (CommonService.isManager(user.roles)) {
  //         vm.manager.page = 1;
  //         handleLoadManagerUsers();
  //       } else {
  //         vm.member.page = 1;
  //         handleLoadMemberUsers();
  //       }
  //     });
  //     vm.deleted.data = _.without(vm.deleted.data, user);
  //   });
  // };
  // vm.handleDatabaseDeleteUser = function (user) {
  //   $scope.handleShowConfirm({
  //     message: user.displayName + 'を完全削除しますか？'
  //   }, function () {
  //     var rsUser = new AdminUserService({ _id: user._id });
  //     rsUser.$remove();
  //     if (user.status === 3) {
  //       vm.deleted.data = _.without(vm.deleted.data, user);
  //       return;
  //     }
  //     if (CommonService.isAdmin(user.roles)) {
  //       vm.admin.data = _.without(vm.admin.data, user);
  //     } else if (CommonService.isManager(user.roles)) {
  //       vm.manager.data = _.without(vm.manager.data, user);
  //     } else {
  //       vm.member.data = _.without(vm.member.data, user);
  //     }
  //   });
  // };
  // vm.handleDatabaseClearAll = function () {
  //   $scope.handleShowConfirm({
  //     message: '全ての削除されたアカウントを削除しますか？'
  //   }, function () {
  //     AdminUserApi.clearDeletedUsers()
  //       .success(function () { delete vm.deleted; });
  //   });
  // };

  // function createArrayFromRange(range) {
  //   var array = [];
  //   for (var i = 1; i <= range; i++) {
  //     array.push(i);
  //   }
  //   return array;
  // }
}
