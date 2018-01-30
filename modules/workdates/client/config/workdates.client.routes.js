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
        template: '<ui-view/>'
      })
      .state('workdates.list', {
        url: '',
        templateUrl: 'modules/workdates/client/views/list-workdates.client.view.html',
        controller: 'WorkdatesListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Workdates List'
        }
      })
      .state('workdates.create', {
        url: '/create',
        templateUrl: 'modules/workdates/client/views/form-workdate.client.view.html',
        controller: 'WorkdatesController',
        controllerAs: 'vm',
        resolve: {
          workdateResolve: newWorkdate
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Workdates Create'
        }
      })
      .state('workdates.edit', {
        url: '/:workdateId/edit',
        templateUrl: 'modules/workdates/client/views/form-workdate.client.view.html',
        controller: 'WorkdatesController',
        controllerAs: 'vm',
        resolve: {
          workdateResolve: getWorkdate
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Workdate {{ workdateResolve.name }}'
        }
      })
      .state('workdates.view', {
        url: '/:workdateId',
        templateUrl: 'modules/workdates/client/views/view-workdate.client.view.html',
        controller: 'WorkdatesController',
        controllerAs: 'vm',
        resolve: {
          workdateResolve: getWorkdate
        },
        data: {
          pageTitle: 'Workdate {{ workdateResolve.name }}'
        }
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
