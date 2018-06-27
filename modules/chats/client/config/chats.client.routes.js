(function () {
  'use strict';

  angular
    .module('chats')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('chats', {
        abstract: true,
        url: '/chats',
        template: '<ui-view/>',
        data: { roles: ['user'] },
        ncyBreadcrumb: { label: 'チャット' }
      })
      .state('chats.list', {
        url: '',
        templateUrl: 'modules/chats/client/views/list-chats.client.view.html',
        controller: 'ChatsListController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: 'ホーム' }
      });
  }

  getChat.$inject = ['$stateParams', 'ChatsService'];

  function getChat($stateParams, ChatsService) {
    return ChatsService.get({
      chatId: $stateParams.chatId
    }).$promise;
  }

  newChat.$inject = ['ChatsService'];

  function newChat(ChatsService) {
    return new ChatsService();
  }
}());
