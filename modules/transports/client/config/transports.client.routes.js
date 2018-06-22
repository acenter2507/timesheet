(function () {
  'use strict';

  angular
    .module('transports')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('transports', {
        abstract: true,
        url: '/transports',
        template: '<ui-view/>'
      })
      .state('transports.list', {
        url: '',
        templateUrl: 'modules/transports/client/views/list-transports.client.view.html',
        controller: 'TransportsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Transports List'
        }
      })
      .state('transports.create', {
        url: '/create',
        templateUrl: 'modules/transports/client/views/form-transport.client.view.html',
        controller: 'TransportsController',
        controllerAs: 'vm',
        resolve: {
          transportResolve: newTransport
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Transports Create'
        }
      })
      .state('transports.edit', {
        url: '/:transportId/edit',
        templateUrl: 'modules/transports/client/views/form-transport.client.view.html',
        controller: 'TransportsController',
        controllerAs: 'vm',
        resolve: {
          transportResolve: getTransport
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Transport {{ transportResolve.name }}'
        }
      })
      .state('transports.view', {
        url: '/:transportId',
        templateUrl: 'modules/transports/client/views/view-transport.client.view.html',
        controller: 'TransportsController',
        controllerAs: 'vm',
        resolve: {
          transportResolve: getTransport
        },
        data: {
          pageTitle: 'Transport {{ transportResolve.name }}'
        }
      });
  }

  getTransport.$inject = ['$stateParams', 'TransportsService'];

  function getTransport($stateParams, TransportsService) {
    return TransportsService.get({
      transportId: $stateParams.transportId
    }).$promise;
  }

  newTransport.$inject = ['TransportsService'];

  function newTransport(TransportsService) {
    return new TransportsService();
  }
}());
