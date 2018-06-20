(function () {
  'use strict';

  angular
    .module('messages')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('messages', {
        abstract: true,
        url: '/messages',
        template: '<ui-view/>',
        ncyBreadcrumb: { label: 'メッセージ' }
      })
      .state('messages.list', {
        url: '',
        templateUrl: 'modules/messages/client/views/list-messages.client.view.html',
        controller: 'MessagesListController',
        controllerAs: 'vm',
        data: { roles: ['user'] },
        ncyBreadcrumb: { label: '一覧' }
      })
      .state('messages.create', {
        url: '/create',
        templateUrl: 'modules/messages/client/views/form-message.client.view.html',
        controller: 'MessagesController',
        controllerAs: 'vm',
        resolve: { messageResolve: newMessage },
        data: { roles: ['admin', 'accountant'] },
        ncyBreadcrumb: { label: '作成' }
      })
      .state('messages.view', {
        url: '/:messageId',
        templateUrl: 'modules/messages/client/views/view-message.client.view.html',
        controller: 'ViewMessageController',
        controllerAs: 'vm',
        data: { roles: ['user'] },
        resolve: { messageResolve: getMessage },
        ncyBreadcrumb: { label: '詳細' }
      });
  }

  getMessage.$inject = ['$stateParams', 'MessagesService'];

  function getMessage($stateParams, MessagesService) {
    return MessagesService.get({
      messageId: $stateParams.messageId
    }).$promise;
  }

  newMessage.$inject = ['MessagesService'];

  function newMessage(MessagesService) {
    return new MessagesService();
  }
}());
