'use strict';

// Setting up route
angular.module('core.admin').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin', {
        abstract: true,
        url: '/admin',
        template: '<ui-view/>',
        data: { roles: ['admin'] },
        ncyBreadcrumb: { label: 'システム管理' }
      })
      .state('accountant', {
        abstract: true,
        url: '/accountant',
        template: '<ui-view/>',
        data: { roles: ['accountant'] },
        ncyBreadcrumb: { label: '経理部' }
      })
      .state('manager', {
        abstract: true,
        url: '/manager',
        template: '<ui-view/>',
        data: { roles: ['manager'] },
        ncyBreadcrumb: { label: 'マネージャー' }
      })
      .state('reviewer', {
        abstract: true,
        url: '/reviewer',
        template: '<ui-view/>',
        data: { roles: ['reviewer'] },
        ncyBreadcrumb: { label: '確認者' }
      });
  }
]);
