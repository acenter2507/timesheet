(function () {
  'use strict';

  angular
    .module('rests')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('rests', {
        abstract: true,
        url: '/rests',
        template: '<ui-view/>',
        ncyBreadcrumb: { label: '休暇' }
      })
      .state('rests.list', {
        url: '',
        templateUrl: 'modules/rests/client/views/list-rests.client.view.html',
        controller: 'RestsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Rests List'
        }
      })
      .state('rests.create', {
        url: '/create',
        templateUrl: 'modules/rests/client/views/form-rest.client.view.html',
        controller: 'RestInputController',
        controllerAs: 'vm',
        resolve: { restResolve: newRest },
        data: { roles: ['user', 'admin', 'manager', 'accountant'] },
        ncyBreadcrumb: { label: '登録' }
      })
      .state('rests.edit', {
        url: '/:restId/edit',
        templateUrl: 'modules/rests/client/views/form-rest.client.view.html',
        controller: 'RestsController',
        controllerAs: 'vm',
        resolve: {
          restResolve: getRest
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Rest {{ restResolve.name }}'
        }
      })
      .state('rests.view', {
        url: '/:restId',
        templateUrl: 'modules/rests/client/views/view-rest.client.view.html',
        controller: 'RestsController',
        controllerAs: 'vm',
        resolve: {
          restResolve: getRest
        },
        data: {
          pageTitle: 'Rest {{ restResolve.name }}'
        }
      });
  }

  getRest.$inject = ['$stateParams', 'RestsService'];

  function getRest($stateParams, RestsService) {
    return RestsService.get({
      restId: $stateParams.restId
    }).$promise;
  }

  newRest.$inject = ['RestsService'];

  function newRest(RestsService) {
    return new RestsService();
  }
}());
