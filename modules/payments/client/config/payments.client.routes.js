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
      .state('payments.trip', {
        url: '/trip',
        templateUrl: 'modules/payments/client/views/components/payment-trip.client.template.html',
        controller: 'PaymentTripController',
        controllerAs: 'vm',
        data: { roles: ['user'] },
        ncyBreadcrumb: { label: '出張旅費' }
      })
      .state('payments.other', {
        url: '/other',
        templateUrl: 'modules/payments/client/views/components/payment-other.client.template.html',
        controller: 'PaymentOtherController',
        controllerAs: 'vm',
        data: { roles: ['user'] },
        ncyBreadcrumb: { label: 'その他の費用（備品等）' }
      })
      .state('payments.vehicle', {
        url: '/vehicle',
        templateUrl: 'modules/payments/client/views/components/payment-vehicle.client.template.html',
        controller: 'PaymentVehicleController',
        controllerAs: 'vm',
        data: { roles: ['user'] },
        ncyBreadcrumb: { label: '車両燃料費' }
      })
      .state('payments.meeting', {
        url: '/meeting',
        templateUrl: 'modules/payments/client/views/components/payment-meeting.client.template.html',
        controller: 'PaymentMeetingController',
        controllerAs: 'vm',
        data: { roles: ['user'] },
        ncyBreadcrumb: { label: '会議費 ･接待交際費報告書' }
      })
      .state('payments.edit', {
        url: '/:paymentId/edit',
        templateUrl: 'modules/payments/client/views/payment.client.view.html',
        controller: 'PaymentsController',
        controllerAs: 'vm',
        data: { roles: ['user'] },
        ncyBreadcrumb: { label: '清算表入力' }
      })
      .state('payments.transport', {
        url: '/:paymentId/transport?transport',
        templateUrl: 'modules/payments/client/views/components/payment-transport.client.template.html',
        controller: 'PaymentTransportController',
        controllerAs: 'vm',
        data: { roles: ['user'] },
        ncyBreadcrumb: { label: '交通費' }
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
