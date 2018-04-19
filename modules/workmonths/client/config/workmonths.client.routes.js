(function () {
  'use strict';

  angular
    .module('workmonths')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('workmonths', {
        abstract: true,
        url: '/workmonths',
        template: '<ui-view/>',
        ncyBreadcrumb: { label: '勤務表' }
      })
      .state('workmonths.list', {
        url: '?year',
        templateUrl: 'modules/workmonths/client/views/list-workmonths.client.view.html',
        controller: 'WorkmonthsListController',
        controllerAs: 'vm',
        data: { roles: ['user', 'admin', 'manager', 'accountant'] },
        ncyBreadcrumb: { label: '一覧' }
      })
      .state('workmonths.reviews', {
        url: '?user',
        templateUrl: 'modules/workmonths/client/views/reviews-workmonths.client.view.html',
        controller: 'WorkmonthsReviewsController',
        controllerAs: 'vm',
        data: { roles: ['accountant', 'admin'] },
        ncyBreadcrumb: { label: '確認' }
      })
      .state('workmonths.view', {
        url: '/:workmonthId',
        templateUrl: 'modules/workmonths/client/views/view-workmonth.client.view.html',
        controller: 'WorkmonthsController',
        controllerAs: 'vm',
        resolve: { workmonthResolve: getWorkmonth },
        data: { roles: ['user', 'admin', 'manager', 'accountant'] },
        ncyBreadcrumb: { label: '詳細' }
      });
  }

  getWorkmonth.$inject = ['$stateParams', 'WorkmonthsService'];

  function getWorkmonth($stateParams, WorkmonthsService) {
    return WorkmonthsService.get({
      workmonthId: $stateParams.workmonthId
    }).$promise;
  }

  newWorkmonth.$inject = ['WorkmonthsService'];

  function newWorkmonth(WorkmonthsService) {
    return new WorkmonthsService();
  }
}());
