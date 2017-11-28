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
        data: { roles: ['user', 'admin', 'manager', 'accountant'] }
      })
      .state('months.create', {
        url: '/create',
        templateUrl: 'modules/months/client/views/form-month.client.view.html',
        controller: 'MonthsController',
        controllerAs: 'vm',
        resolve: {
          monthResolve: newMonth
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Months Create'
        }
      })
      .state('months.edit', {
        url: '/:monthId/edit',
        templateUrl: 'modules/months/client/views/form-month.client.view.html',
        controller: 'MonthsController',
        controllerAs: 'vm',
        resolve: {
          monthResolve: getMonth
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Month {{ monthResolve.name }}'
        }
      })
      .state('months.view', {
        url: '/:monthId',
        templateUrl: 'modules/months/client/views/view-month.client.view.html',
        controller: 'MonthsController',
        controllerAs: 'vm',
        resolve: {
          monthResolve: getMonth
        },
        data: {
          pageTitle: 'Month {{ monthResolve.name }}'
        }
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
