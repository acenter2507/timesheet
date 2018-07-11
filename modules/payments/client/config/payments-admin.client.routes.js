(function () {
  'use strict';

  angular
    .module('payments.admin')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.payments', {
        abstract: true,
        url: '/payments',
        template: '<ui-view/>',
        ncyBreadcrumb: { label: '費用清算管理' }
      })
      .state('admin.payments.reviews', {
        url: '/reviews?user?status',
        templateUrl: 'modules/payments/client/views/admin/review-payments.client.view.html',
        controller: 'PaymentsReviewController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '清算表確認' }
      })
      .state('admin.payments.review', {
        url: '/:paymentId/review',
        templateUrl: 'modules/payments/client/views/admin/review-payment.client.view.html',
        controller: 'PaymentReviewController',
        controllerAs: 'vm',
        data: { roles: ['accountant', 'admin'] },
        ncyBreadcrumb: { label: '清算表詳細' }
      });
  }
}());
