(function () {
  'use strict';

  angular
    .module('bookings.admin')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.bookings', {
        abstract: true,
        url: '/bookings',
        template: '<ui-view/>',
        ncyBreadcrumb: { label: '予約' }
      })
      .state('admin.bookings.list', {
        url: '',
        templateUrl: 'modules/rooms/client/views/admin/bookings-admin.client.view.html',
        controller: 'BookingsAdminController',
        controllerAs: 'vm',
        data: { roles: ['accountant', 'admin'] },
        ncyBreadcrumb: { label: '予約一覧' }
      });
  }
}());
