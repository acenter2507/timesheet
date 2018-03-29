(function () {
  'use strict';

  angular
    .module('workdates')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('workdates', {
        abstract: true,
        url: '/workdates',
        template: '<ui-view/>',
        ncyBreadcrumb: { label: '勤務時間' }
      })
      .state('workdates.view', {
        url: '/:workdateId',
        templateUrl: 'modules/workdates/client/views/view-workdate.client.view.html',
        controller: 'WorkdatesController',
        controllerAs: 'vm',
        resolve: { workdateResolve: getWorkdate },
        data: { roles: ['user'] },
        ncyBreadcrumb: { label: '入力' }
      });
  }

  getWorkdate.$inject = ['$stateParams', 'WorkdatesService'];
  function getWorkdate($stateParams, WorkdatesService) {
    return WorkdatesService.get({
      workdateId: $stateParams.workdateId
    }).$promise;
  }

  newWorkdate.$inject = ['WorkdatesService'];
  function newWorkdate(WorkdatesService) {
    return new WorkdatesService();
  }
}());
