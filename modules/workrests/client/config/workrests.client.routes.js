(function () {
  'use strict';

  angular
    .module('workrests')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('workrests', {
        abstract: true,
        url: '/workrests',
        template: '<ui-view/>'
      })
      .state('workrests.list', {
        url: '',
        templateUrl: 'modules/workrests/client/views/list-workrests.client.view.html',
        controller: 'WorkrestsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Workrests List'
        }
      })
      .state('workrests.create', {
        url: '/create',
        templateUrl: 'modules/workrests/client/views/form-workrest.client.view.html',
        controller: 'WorkrestsController',
        controllerAs: 'vm',
        resolve: {
          workrestResolve: newWorkrest
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Workrests Create'
        }
      })
      .state('workrests.edit', {
        url: '/:workrestId/edit',
        templateUrl: 'modules/workrests/client/views/form-workrest.client.view.html',
        controller: 'WorkrestsController',
        controllerAs: 'vm',
        resolve: {
          workrestResolve: getWorkrest
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Workrest {{ workrestResolve.name }}'
        }
      })
      .state('workrests.view', {
        url: '/:workrestId',
        templateUrl: 'modules/workrests/client/views/view-workrest.client.view.html',
        controller: 'WorkrestsController',
        controllerAs: 'vm',
        resolve: {
          workrestResolve: getWorkrest
        },
        data: {
          pageTitle: 'Workrest {{ workrestResolve.name }}'
        }
      });
  }

  getWorkrest.$inject = ['$stateParams', 'WorkrestsService'];

  function getWorkrest($stateParams, WorkrestsService) {
    return WorkrestsService.get({
      workrestId: $stateParams.workrestId
    }).$promise;
  }

  newWorkrest.$inject = ['WorkrestsService'];

  function newWorkrest(WorkrestsService) {
    return new WorkrestsService();
  }
}());
