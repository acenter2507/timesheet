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
        ncyBreadcrumb: { label: 'アカウント管理' }
      })
      .state('admin.users.list', {
        url: '?role?status',
        templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController',
        controllerAs: 'vm',
        data: { roles: ['admin'] },
        ncyBreadcrumb: { label: 'アカウント一覧' }
      })
      .state('admin.users.create', {
        url: '/create',
        templateUrl: 'modules/users/client/views/admin/form-user.client.view.html',
        controller: 'UserController',
        controllerAs: 'vm',
        data: { roles: ['admin'] },
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
        data: { roles: ['admin'] },
        resolve: {
          userResolve: ['$stateParams', 'AdminUserService', function ($stateParams, AdminUserService) {
            return AdminUserService.get({
              userId: $stateParams.userId
            }).$promise;
          }]
        },
        ncyBreadcrumb: { label: 'アカウント編集' }
      });
  }
]);
