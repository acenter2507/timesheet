'use strict';

// Setting up route
angular.module('users.admin').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.users', {
        url: '/users',
        abstract: true,
        template: '<ui-view></ui-view>',
        data: { roles: ['admin'] },
        ncyBreadcrumb: { label: '社員管理' }
      })
      .state('admin.users.list', {
        url: '?role?status',
        templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController',
        controllerAs: 'vm',
        data: { roles: ['admin'] },
        ncyBreadcrumb: { label: '社員一覧' }
      })
      .state('admin.users.create', {
        url: '/create',
        templateUrl: 'modules/users/client/views/admin/input-user.client.view.html',
        controller: 'UserInputController',
        controllerAs: 'vm',
        data: { roles: ['admin'] },
        resolve: {
          userResolve: ['AdminUserService', function (AdminUserService) {
            return new AdminUserService();
          }]
        },
        ncyBreadcrumb: { label: '新規アカウント登録' }
      })
      .state('admin.admin.users.view', {
        url: '/:userId',
        templateUrl: 'modules/users/client/views/admin/view-user.client.view.html',
        controller: 'UserController',
        controllerAs: 'vm',
        data: { roles: ['admin'] },
        resolve: {
          userResolve: ['$stateParams', 'AdminUserService', function ($stateParams, AdminUserService) {
            return AdminUserService.get({ userId: $stateParams.userId }).$promise;
          }]
        },
        ncyBreadcrumb: { label: '社員詳細' }
      })
      .state('admin.users.edit', {
        url: '/:userId/edit',
        templateUrl: 'modules/users/client/views/admin/input-user.client.view.html',
        controller: 'UserInputController',
        controllerAs: 'vm',
        data: { roles: ['admin'] },
        resolve: {
          userResolve: ['$stateParams', 'AdminUserService', function ($stateParams, AdminUserService) {
            return AdminUserService.get({
              userId: $stateParams.userId
            }).$promise;
          }]
        },
        ncyBreadcrumb: { label: '社員情報編集' }
      });
  }
]);
