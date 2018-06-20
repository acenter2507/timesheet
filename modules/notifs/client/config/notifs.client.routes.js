(function () {
  'use strict';

  angular
    .module('notifs')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('notifs', {
        abstract: true,
        url: '/notifs',
        template: '<ui-view/>',
        ncyBreadcrumb: { label: 'お知らせ' }
      })
      .state('notifs.list', {
        url: '',
        templateUrl: 'modules/notifs/client/views/list-notifs.client.view.html',
        controller: 'NotifsListController',
        controllerAs: 'vm',
        data: { roles: ['user'] },
        ncyBreadcrumb: { label: '一覧' }
      });
  }

}());
