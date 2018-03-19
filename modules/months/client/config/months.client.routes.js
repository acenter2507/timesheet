(function () {
  'use strict';

  angular
    .module('months')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('months', {
        abstract: true,
        url: '/months',
        template: '<ui-view/>',
        ncyBreadcrumb: { label: '勤務表' }
      })
      .state('months.list', {
        url: '?year',
        templateUrl: 'modules/months/client/views/list-months.client.view.html',
        controller: 'MonthsListController',
        controllerAs: 'vm',
        data: { roles: ['user', 'admin', 'manager', 'accountant'] },
        ncyBreadcrumb: { label: '一覧' }
      })
      .state('months.view', {
        url: '/:monthId',
        templateUrl: 'modules/months/client/views/view-month.client.view.html',
        controller: 'MonthsController',
        controllerAs: 'vm',
        resolve: { monthResolve: getMonth },
        data: { roles: ['user', 'admin', 'manager', 'accountant'] },
        ncyBreadcrumb: { label: '詳細' }
      })
      .state('months.date', {
        url: '/:date',
        templateUrl: 'modules/months/client/views/date-month.client.view.html',
        controller: 'DateController',
        controllerAs: 'vm',
        data: { roles: ['user', 'admin', 'manager', 'accountant'] },
        ncyBreadcrumb: { label: '勤務時間入力' }
      });
  }

  getMonth.$inject = ['$stateParams', 'MonthsService'];

  function getMonth($stateParams, MonthsService) {
    return MonthsService.get({
      monthId: $stateParams.monthId
    }).$promise;
  }

  newMonth.$inject = ['MonthsService'];

  function newMonth(MonthsService) {
    return new MonthsService();
  }
}());
