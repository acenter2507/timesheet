'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
        data: { roles: ['user'] },
        ncyBreadcrumb: { label: '個人情報' }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: 'modules/users/client/views/settings/edit-profile.client.view.html',
        ncyBreadcrumb: { label: '編集' }
      })
      .state('settings.password', {
        url: '/password',
        templateUrl: 'modules/users/client/views/settings/change-password.client.view.html',
        ncyBreadcrumb: { label: 'パスワード変更' }
      })
      .state('settings.picture', {
        url: '/picture',
        templateUrl: 'modules/users/client/views/settings/change-profile-picture.client.view.html',
        ncyBreadcrumb: { label: 'アバター変更' }
      })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html',
        ncyBreadcrumb: { label: '認証' }
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: 'modules/users/client/views/authentication/signin.client.view.html',
        ncyBreadcrumb: { label: 'ログイン' }
      })
      // PROFILE
      .state('profile', {
        abstract: true,
        url: '/profile',
        template: '<ui-view/>',
        data: { roles: ['user'] },
        ncyBreadcrumb: { label: 'プロファイル' }
      })
      .state('profile.view', {
        url: '/:userId',
        templateUrl: 'modules/users/client/views/profile/view-profile.client.view.html',
        controller: 'UserListController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '{{vm.profile.displayName}}' }
      });
  }
]);
