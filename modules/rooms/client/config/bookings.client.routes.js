(function () {
  'use strict';

  angular
    .module('bookings')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('bookings', {
        abstract: true,
        url: '/bookings',
        template: '<ui-view/>',
        ncyBreadcrumb: { label: '会議室予約' }
      })
      .state('bookings.list', {
        url: '',
        templateUrl: 'modules/bookings/client/views/list-bookings.client.view.html',
        controller: 'BookingsListController',
        controllerAs: 'vm',
        data: { roles: ['user'] },
        ncyBreadcrumb: { label: '予約履歴' }
      })
      .state('bookings.create', {
        url: '/new',
        templateUrl: 'modules/rooms/client/views/form-booking.client.view.html',
        controller: 'BookingsController',
        controllerAs: 'vm',
        resolve: { bookingResolve: newBooking },
        data: { roles: ['user'] },
        ncyBreadcrumb: { label: '新規予約' }
      });
  }

  getBooking.$inject = ['$stateParams', 'BookingsService'];

  function getBooking($stateParams, BookingsService) {
    return BookingsService.get({
      bookingId: $stateParams.bookingId
    }).$promise;
  }
  newBooking.$inject = ['BookingsService'];

  function newBooking(BookingsService) {
    return new BookingsService();
  }
}());
