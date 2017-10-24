'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('users', {
        url: '/users',
        abstract: true,
        template: '<ui-view></ui-view>',
        ncyBreadcrumb: { label: '社員' }
      })
      .state('users.list', {
        url: '',
        templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '社員一覧' }
      })
      .state('users.new', {
        url: '/new',
        templateUrl: 'modules/users/client/views/admin/input-user.client.view.html',
        controller: 'UserInputController',
        controllerAs: 'vm',
        data: { roles: ['admin', 'accountant'] },
        resolve: {
          userResolve: ['AdminUserService', function (AdminUserService) {
            return new AdminUserService();
          }]
        },
        ncyBreadcrumb: { label: '社員追加' }
      })
      .state('users.view', {
        url: '/:userId',
        templateUrl: 'modules/users/client/views/admin/view-user.client.view.html',
        controller: 'UserController',
        controllerAs: 'vm',
        resolve: {
          userResolve: ['$stateParams', 'AdminUserService', function ($stateParams, AdminUserService) {
            return AdminUserService.get({
              userId: $stateParams.userId
            }).$promise;
          }]
        },
        ncyBreadcrumb: { label: '社員詳細' }
      })
      .state('users.edit', {
        url: '/:userId/edit',
        templateUrl: 'modules/users/client/views/admin/input-user.client.view.html',
        controller: 'UserInputController',
        controllerAs: 'vm',
        data: { roles: ['admin', 'accountant'] },
        resolve: {
          userResolve: ['$stateParams', 'AdminUserService', function ($stateParams, AdminUserService) {
            return AdminUserService.get({
              userId: $stateParams.userId
            }).$promise;
          }]
        },
        ncyBreadcrumb: { label: '社員編集' }
      })
      .state('users.timesheet', {
        url: '/:userId/timesheet',
        templateUrl: 'modules/users/client/views/admin/timesheet-user.client.view.html',
        // controller: 'UserInputController',
        // controllerAs: 'vm',
        // data: { roles: ['admin', 'accountant'] },
        resolve: {
          userResolve: ['$stateParams', 'AdminUserService', function ($stateParams, AdminUserService) {
            return AdminUserService.get({
              userId: $stateParams.userId
            }).$promise;
          }]
        },
        ncyBreadcrumb: { label: '社員の勤務表' }
      });
  }
]);
