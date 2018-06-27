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
        template: '<ui-view/>'
      })
      .state('chats.list', {
        url: '',
        templateUrl: 'modules/chats/client/views/list-chats.client.view.html',
        controller: 'ChatsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Chats List'
        }
      })
      .state('chats.create', {
        url: '/create',
        templateUrl: 'modules/chats/client/views/form-chat.client.view.html',
        controller: 'ChatsController',
        controllerAs: 'vm',
        resolve: {
          chatResolve: newChat
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Chats Create'
        }
      })
      .state('chats.edit', {
        url: '/:chatId/edit',
        templateUrl: 'modules/chats/client/views/form-chat.client.view.html',
        controller: 'ChatsController',
        controllerAs: 'vm',
        resolve: {
          chatResolve: getChat
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Chat {{ chatResolve.name }}'
        }
      })
      .state('chats.view', {
        url: '/:chatId',
        templateUrl: 'modules/chats/client/views/view-chat.client.view.html',
        controller: 'ChatsController',
        controllerAs: 'vm',
        resolve: {
          chatResolve: getChat
        },
        data: {
          pageTitle: 'Chat {{ chatResolve.name }}'
        }
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
