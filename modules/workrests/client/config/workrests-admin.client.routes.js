(function () {
  'use strict';

  angular
    .module('workrests.admin')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.workrests', {
        abstract: true,
        url: '/workrests',
        template: '<ui-view/>',
        ncyBreadcrumb: { label: '休暇管理' }
      })
      .state('admin.workrests.review', {
        url: '/reviews?user?status?notif',
        templateUrl: 'modules/workrests/client/views/review-workrest.client.view.html',
        controller: 'WorkrestsReviewController',
        controllerAs: 'vm',
        data: { roles: ['admin', 'manager', 'accountant'] },
        ncyBreadcrumb: { label: '休暇確認' }
      });
  }
}());
