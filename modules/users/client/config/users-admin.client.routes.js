'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('users', {
        url: '/users',
        abstract: true,
        template: '<ui-view></ui-view>'
      })
      .state('users.list', {
        url: '',
        templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController',
        controllerAs: 'vm',
      })
      .state('users.view', {
        url: '/:userId',
        templateUrl: 'modules/users/client/views/admin/view-user.client.view.html',
        controller: 'UserController',
        controllerAs: 'vm',
      })
      .state('users.edit', {
        url: '/:userId/edit',
        templateUrl: 'modules/users/client/views/admin/input-user.client.view.html',
        controller: 'UserInputController',
        controllerAs: 'vm',
      })
      .state('users.create', {
        url: '/create',
        templateUrl: 'modules/users/client/views/admin/input-user.client.view.html',
        controller: 'UserInputController',
        controllerAs: 'vm',
      });
  }
]);
