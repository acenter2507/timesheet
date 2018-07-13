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
      .state('admin.workrests.reviews', {
        url: '/reviews?user?status?notif',
        templateUrl: 'modules/workrests/client/views/admin/review-workrests.client.view.html',
        controller: 'WorkrestsReviewController',
        controllerAs: 'vm',
        data: { roles: ['admin', 'manager', 'accountant'] },
        ncyBreadcrumb: { label: '休暇確認' }
      })
      .state('admin.workrests.review', {
        url: '/:workrestId/review',
        templateUrl: 'modules/workrests/client/views/admin/review-workrest.client.view.html',
        controller: 'WorkrestReviewController',
        controllerAs: 'vm',
        resolve: { workrestResolve: getWorkrest },
        data: { roles: ['admin', 'manager', 'accountant'] },
        ncyBreadcrumb: { label: '休暇詳細' }
      });
  }


  getWorkrest.$inject = ['$stateParams', 'WorkrestsService'];

  function getWorkrest($stateParams, WorkrestsService) {
    return WorkrestsService.get({
      workrestId: $stateParams.workrestId
    }).$promise;
  }
}());
