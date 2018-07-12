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
        data: { roles: ['user'] },
        ncyBreadcrumb: { label: '休暇管理' }
      })
      .state('workrests.list', {
        url: '?notif',
        templateUrl: 'modules/workrests/client/views/list-workrests.client.view.html',
        controller: 'WorkrestsListController',
        controllerAs: 'vm',
        data: { roles: ['user'] },
        ncyBreadcrumb: { label: '休暇一覧' }
      })
      .state('workrests.create', {
        url: '/create',
        templateUrl: 'modules/workrests/client/views/form-workrest.client.view.html',
        controller: 'WorkrestInputController',
        controllerAs: 'vm',
        resolve: { workrestResolve: newWorkrest },
        data: { roles: ['user'] },
        ncyBreadcrumb: { label: '休暇登録' }
      })
      .state('workrests.edit', {
        url: '/:workrestId/edit?notif',
        templateUrl: 'modules/workrests/client/views/form-workrest.client.view.html',
        controller: 'WorkrestInputController',
        controllerAs: 'vm',
        resolve: { workrestResolve: getWorkrest },
        data: { roles: ['user'] },
        ncyBreadcrumb: { label: '休暇編集' }
      })
      .state('workrests.view', {
        url: '/:workrestId?notif',
        templateUrl: 'modules/workrests/client/views/view-workrest.client.view.html',
        controller: 'WorkrestsController',
        controllerAs: 'vm',
        resolve: { workrestResolve: getWorkrest },
        data: { roles: ['user'] },
        ncyBreadcrumb: { label: '休暇詳細' }
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
