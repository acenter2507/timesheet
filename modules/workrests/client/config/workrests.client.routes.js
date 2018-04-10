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
        template: '<ui-view/>',
        ncyBreadcrumb: { label: '休暇' }
      })
      .state('workrests.list', {
        url: '?notif',
        templateUrl: 'modules/workrests/client/views/list-workrests.client.view.html',
        controller: 'WorkrestsListController',
        controllerAs: 'vm',
        data: { roles: ['user', 'admin', 'manager', 'accountant'] },
        ncyBreadcrumb: { label: '一覧' }
      })
      .state('workrests.review', {
        url: '/review?notif?status',
        templateUrl: 'modules/workrests/client/views/review-workrest.client.view.html',
        controller: 'WorkrestsReviewController',
        controllerAs: 'vm',
        data: { roles: ['admin', 'manager', 'accountant'] },
        ncyBreadcrumb: { label: '確認' }
      })
      .state('workrests.create', {
        url: '/create',
        templateUrl: 'modules/workrests/client/views/form-workrest.client.view.html',
        controller: 'WorkrestInputController',
        controllerAs: 'vm',
        resolve: { workrestResolve: newWorkrest },
        data: { roles: ['user', 'admin', 'manager', 'accountant'] },
        ncyBreadcrumb: { label: '登録' }
      })
      .state('workrests.edit', {
        url: '/:workrestId/edit?notif',
        templateUrl: 'modules/workrests/client/views/form-workrest.client.view.html',
        controller: 'WorkrestInputController',
        controllerAs: 'vm',
        resolve: { workrestResolve: getWorkrest },
        data: { roles: ['user', 'admin', 'manager', 'accountant'] },
        ncyBreadcrumb: { label: '編集' }
      })
      .state('workrests.view', {
        url: '/:workrestId?notif',
        templateUrl: 'modules/workrests/client/views/view-workrest.client.view.html',
        controller: 'WorkrestsController',
        controllerAs: 'vm',
        resolve: { workrestResolve: getWorkrest },
        data: { roles: ['user', 'admin', 'manager', 'accountant'] },
        ncyBreadcrumb: { label: '詳細' }
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
