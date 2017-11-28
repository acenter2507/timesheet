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
        url: '?notifId',
        templateUrl: 'modules/rests/client/views/list-rests.client.view.html',
        controller: 'RestsListController',
        controllerAs: 'vm',
        data: { roles: ['user', 'admin', 'manager', 'accountant'] },
        ncyBreadcrumb: { label: '一覧' }
      })
      .state('rests.review', {
        url: '/review?notifId',
        templateUrl: 'modules/rests/client/views/review-rest.client.view.html',
        controller: 'RestsReviewController',
        controllerAs: 'vm',
        data: { roles: ['admin', 'manager', 'accountant'] },
        ncyBreadcrumb: { label: '確認' }
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
        url: '/:restId/edit?notifId',
        templateUrl: 'modules/rests/client/views/form-rest.client.view.html',
        controller: 'RestInputController',
        controllerAs: 'vm',
        resolve: { restResolve: getRest },
        data: { roles: ['user', 'admin', 'manager', 'accountant'] },
        ncyBreadcrumb: { label: '編集' }
      })
      .state('rests.view', {
        url: '/:restId?notifId',
        templateUrl: 'modules/rests/client/views/view-rest.client.view.html',
        controller: 'RestsController',
        controllerAs: 'vm',
        resolve: { restResolve: getRest },
        data: { roles: ['user', 'admin', 'manager', 'accountant'] },
        ncyBreadcrumb: { label: '詳細' }
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
