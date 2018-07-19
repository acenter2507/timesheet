(function () {
  'use strict';

  angular
    .module('holidays.admin')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.holidays', {
        abstract: true,
        url: '/holidays',
        template: '<ui-view/>',
        data: { roles: ['admin', 'accountant'] },
        ncyBreadcrumb: { label: '休日形態管理' }
      })
      .state('admin.holidays.list', {
        url: '',
        templateUrl: 'modules/holidays/client/views/list-holidays.client.view.html',
        controller: 'HolidaysListController',
        controllerAs: 'vm',
        data: { roles: ['admin', 'accountant'] },
        ncyBreadcrumb: { label: '休日形態一覧' }
      });
  }
}());
