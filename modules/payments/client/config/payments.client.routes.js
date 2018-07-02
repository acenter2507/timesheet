(function () {
  'use strict';

  angular
    .module('payments')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('payments', {
        abstract: true,
        url: '/payments',
        template: '<ui-view/>',
        ncyBreadcrumb: { label: '費用清算管理' }
      })
      .state('payments.list', {
        url: '?year',
        templateUrl: 'modules/payments/client/views/list-payments.client.view.html',
        controller: 'PaymentsListController',
        controllerAs: 'vm',
        data: { roles: ['user'] },
        ncyBreadcrumb: { label: '清算表一覧' }
      })
      .state('payments.reviews', {
        url: '/reviews?user?status',
        templateUrl: 'modules/payments/client/views/reviews-payments.client.view.html',
        controller: 'PaymentsReviewsController',
        controllerAs: 'vm',
        data: { roles: ['accountant', 'admin'] },
        ncyBreadcrumb: { label: '清算表確認' }
      })
      .state('payments.edit', {
        url: '/:paymentId/edit',
        templateUrl: 'modules/payments/client/views/payment.client.view.html',
        controller: 'PaymentsController',
        controllerAs: 'vm',
        data: { roles: ['user'] },
        ncyBreadcrumb: { label: '清算表入力' }
      })
      .state('payments.view', {
        url: '/:paymentId',
        templateUrl: 'modules/payments/client/views/view-payment.client.view.html',
        controller: 'PaymentsController',
        controllerAs: 'vm',
        data: { roles: ['user'] },
        ncyBreadcrumb: { label: '清算表詳細' }
      });
  }
}());
