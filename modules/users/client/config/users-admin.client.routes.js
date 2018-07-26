'use strict';

// Setting up route
angular.module('users.admin').config(['$stateProvider',
  function ($stateProvider) {
    // 管理者
    $stateProvider
      .state('admin.users', {
        url: '/users',
        abstract: true,
        template: '<ui-view></ui-view>',
        ncyBreadcrumb: { label: 'アカウント管理' }
      })
      .state('admin.users.list', {
        url: '?role?status',
        templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: 'アカウント一覧' }
      })
      .state('admin.users.create', {
        url: '/create',
        templateUrl: 'modules/users/client/views/admin/form-user.client.view.html',
        controller: 'UserController',
        controllerAs: 'vm',
        resolve: {
          userResolve: ['AdminUserService', function (AdminUserService) {
            return new AdminUserService();
          }]
        },
        ncyBreadcrumb: { label: 'アカウント登録' }
      })
      .state('admin.users.edit', {
        url: '/:userId/edit',
        templateUrl: 'modules/users/client/views/admin/form-user.client.view.html',
        controller: 'UserController',
        controllerAs: 'vm',
        resolve: {
          userResolve: ['$stateParams', 'AdminUserService', function ($stateParams, AdminUserService) {
            return AdminUserService.get({
              userId: $stateParams.userId
            }).$promise;
          }]
        },
        ncyBreadcrumb: { label: 'アカウント編集' }
      });
    
    // 経理部
    $stateProvider
    .state('accountant.users', {
      url: '/users',
      abstract: true,
      template: '<ui-view></ui-view>',
      ncyBreadcrumb: { label: '社員管理' }
    })
    .state('accountant.users.list', {
      url: '?status?department',
      templateUrl: 'modules/users/client/views/accountant/list-users.client.view.html',
      controller: 'AccountantUsersController',
      controllerAs: 'vm',
      ncyBreadcrumb: { label: '社員一覧' }
    })
    .state('accountant.users.edit', {
      url: '/:userId/edit',
      templateUrl: 'modules/users/client/views/accountant/form-user.client.view.html',
      controller: 'AccountantUserController',
      controllerAs: 'vm',
      resolve: {
        userResolve: ['$stateParams', 'AccountantUserService', function ($stateParams, AccountantUserService) {
          return AccountantUserService.get({ userId: $stateParams.userId }).$promise;
        }]
      },
      ncyBreadcrumb: { label: '社員編集' }
    });
  }
]);
