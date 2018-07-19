(function () {
  'use strict';

  angular
    .module('workdates.admin')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.workdates', {
        abstract: true,
        url: '/workdates',
        template: '<ui-view/>',
        ncyBreadcrumb: { label: '勤務時間' }
      })
      .state('admin.workdates.review', {
        url: '/:workdateId/review',
        templateUrl: 'modules/workdates/client/views/admin/review-workdate.client.view.html',
        controller: 'WorkdateReviewController',
        controllerAs: 'vm',
        resolve: { workdateResolve: getWorkdate },
        data: { roles: ['admin', 'accountant'] },
        ncyBreadcrumb: { label: '勤務時間編集' }
      });
  }

  getWorkdate.$inject = ['$stateParams', 'WorkdatesService'];
  function getWorkdate($stateParams, WorkdatesService) {
    return WorkdatesService.get({
      workdateId: $stateParams.workdateId
    }).$promise;
  }
}());
