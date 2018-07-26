'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
      // .state('settings', {
      //   abstract: true,
      //   url: '/settings',
      //   templateUrl: 'modules/users/client/views/users/profile-setting.client.view.html',
      //   controller: 'ProfileSettingController',
      //   data: { roles: ['user'] },
      //   ncyBreadcrumb: { label: 'プロファイル設定' }
      // })
      // .state('settings.profile', {
      //   url: '/profile',
      //   templateUrl: 'modules/users/client/views/users/edit-profile.client.view.html',
      //   ncyBreadcrumb: { label: '編集' }
      // })
      // .state('settings.password', {
      //   url: '/password',
      //   templateUrl: 'modules/users/client/views/users/change-password.client.view.html',
      //   ncyBreadcrumb: { label: 'パスワード変更' }
      // })
      // .state('settings.picture', {
      //   url: '/picture',
      //   templateUrl: 'modules/users/client/views/users/change-profile-picture.client.view.html',
      //   ncyBreadcrumb: { label: 'アバター変更' }
      // })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        template: '<ui-view></ui-view>',
        ncyBreadcrumb: { label: '認証' }
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: 'modules/users/client/views/users/signin.client.view.html',
        ncyBreadcrumb: { label: 'ログイン' }
      })
      .state('profile', {
        abstract: true,
        url: '/profile',
        template: '<ui-view/>',
        data: { roles: ['user'] },
        ncyBreadcrumb: { label: 'プロファイル' }
      })
      .state('profile.setting', {
        url: '/setting?action',
        templateUrl: 'modules/users/client/views/users/setting-profile.client.view.html',
        controller: 'ProfileSettingController',
        data: { roles: ['user'] },
        ncyBreadcrumb: { label: '設定' }
      })
      .state('profile.view', {
        url: '/:userId',
        templateUrl: 'modules/users/client/views/users/view-profile.client.view.html',
        controller: 'UserListController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '{{vm.profile.displayName}}' }
      });
  }
]);
