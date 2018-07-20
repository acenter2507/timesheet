(function () {
  'use strict';

  angular
    .module('rooms.admin')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.rooms', {
        abstract: true,
        url: '/rooms',
        template: '<ui-view/>',
        ncyBreadcrumb: { label: '会議室管理' }
      })
      .state('admin.rooms.list', {
        url: '',
        templateUrl: 'modules/rooms/client/views/admin/rooms-admin.client.view.html',
        controller: 'RoomsAdminController',
        controllerAs: 'vm',
        data: { roles: ['accountant', 'admin'] },
        ncyBreadcrumb: { label: '会議室一覧' }
      })
      .state('admin.rooms.create', {
        url: '/create',
        templateUrl: 'modules/rooms/client/views/admin/form-room.client.view.html',
        controller: 'RoomAdminController',
        controllerAs: 'vm',
        resolve: { roomResolve: newRoom },
        data: { roles: ['accountant', 'admin'] },
        ncyBreadcrumb: { label: '会議室登録' }
      })
      .state('admin.rooms.edit', {
        url: '/:roomId/edit',
        templateUrl: 'modules/rooms/client/views/admin/form-room.client.view.html',
        controller: 'RoomAdminController',
        controllerAs: 'vm',
        resolve: { roomResolve: getRoom },
        data: { roles: ['accountant', 'admin'] },
        ncyBreadcrumb: { label: '会議室編集' }
      })
      .state('admin.rooms.view', {
        url: '/:roomId',
        templateUrl: 'modules/rooms/client/views/admin/room-admin.client.view.html',
        controller: 'RoomAdminController',
        controllerAs: 'vm',
        resolve: { roomResolve: getRoom },
        data: { roles: ['accountant', 'admin'] },
        ncyBreadcrumb: { label: '会議室詳細' }
      })
      .state('admin.rooms.bookings', {
        url: '/:roomId/bookings',
        templateUrl: 'modules/rooms/client/views/admin/room-bookings.client.view.html',
        controller: 'RoomAdminController',
        controllerAs: 'vm',
        resolve: { roomResolve: getRoom },
        data: { roles: ['accountant', 'admin'] },
        ncyBreadcrumb: { label: '予約状況' }
      });
  }

  getRoom.$inject = ['$stateParams', 'RoomsService'];
  function getRoom($stateParams, RoomsService) {
    return RoomsService.get({
      roomId: $stateParams.roomId
    }).$promise;
  }

  newRoom.$inject = ['RoomsService'];
  function newRoom(RoomsService) {
    return new RoomsService();
  }
}());
