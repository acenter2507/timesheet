(function () {
  'use strict';

  angular
    .module('rooms')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('rooms', {
        abstract: true,
        url: '/rooms',
        template: '<ui-view/>',
        ncyBreadcrumb: { label: '会議室' }
      })
      .state('rooms.list', {
        url: '',
        templateUrl: 'modules/rooms/client/views/list-rooms.client.view.html',
        controller: 'RoomsListController',
        controllerAs: 'vm',
        data: { roles: ['user'] },
        ncyBreadcrumb: { label: '会議室状況' }
      })
      .state('rooms.booking', {
        url: '/:roomId',
        templateUrl: 'modules/rooms/client/views/view-room.client.view.html',
        controller: 'RoomsController',
        controllerAs: 'vm',
        resolve: { roomResolve: getRoom },
        data: { roles: ['user'] },
        ncyBreadcrumb: { label: '会議室詳細' }
      });
  }

  getRoom.$inject = ['$stateParams', 'RoomsService'];

  function getRoom($stateParams, RoomsService) {
    return RoomsService.get({
      roomId: $stateParams.roomId
    }).$promise;
  }
}());
