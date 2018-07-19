(function () {
  'use strict';

  angular
    .module('workmonths.admin')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.workmonths', {
        abstract: true,
        url: '/workmonths',
        template: '<ui-view/>',
        ncyBreadcrumb: { label: '勤務表管理' }
      })
      .state('admin.workmonths.reviews', {
        url: '/reviews?user?status',
        templateUrl: 'modules/workmonths/client/views/admin/reviews-workmonths.client.view.html',
        controller: 'WorkmonthsReviewController',
        controllerAs: 'vm',
        data: { roles: ['accountant', 'admin'] },
        ncyBreadcrumb: { label: '勤務表確認' }
      })
      .state('admin.workmonths.review', {
        url: '/:workmonthId/review',
        templateUrl: 'modules/workmonths/client/views/admin/review-workmonth.client.view.html',
        controller: 'WorkmonthReviewController',
        controllerAs: 'vm',
        resolve: { workmonthResolve: getWorkmonth },
        data: { roles: ['accountant', 'admin'] },
        ncyBreadcrumb: { label: '勤務表詳細' }
      });
  }

  getWorkmonth.$inject = ['$stateParams', 'WorkmonthsService'];

  function getWorkmonth($stateParams, WorkmonthsService) {
    return WorkmonthsService.get({
      workmonthId: $stateParams.workmonthId
    }).$promise;
  }
}());
