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
        template: '<ui-view/>'
      })
      .state('workmonths.list', {
        url: '',
        templateUrl: 'modules/workmonths/client/views/list-workmonths.client.view.html',
        controller: 'WorkmonthsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Workmonths List'
        }
      })
      .state('workmonths.create', {
        url: '/create',
        templateUrl: 'modules/workmonths/client/views/form-workmonth.client.view.html',
        controller: 'WorkmonthsController',
        controllerAs: 'vm',
        resolve: {
          workmonthResolve: newWorkmonth
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Workmonths Create'
        }
      })
      .state('workmonths.edit', {
        url: '/:workmonthId/edit',
        templateUrl: 'modules/workmonths/client/views/form-workmonth.client.view.html',
        controller: 'WorkmonthsController',
        controllerAs: 'vm',
        resolve: {
          workmonthResolve: getWorkmonth
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Workmonth {{ workmonthResolve.name }}'
        }
      })
      .state('workmonths.view', {
        url: '/:workmonthId',
        templateUrl: 'modules/workmonths/client/views/view-workmonth.client.view.html',
        controller: 'WorkmonthsController',
        controllerAs: 'vm',
        resolve: {
          workmonthResolve: getWorkmonth
        },
        data: {
          pageTitle: 'Workmonth {{ workmonthResolve.name }}'
        }
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
