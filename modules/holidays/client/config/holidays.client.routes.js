(function () {
  'use strict';

  angular
    .module('holidays')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('holidays', {
        abstract: true,
        url: '/holidays',
        template: '<ui-view/>',
        data: { roles: ['admin', 'accountant'] },
        ncyBreadcrumb: { label: '休日形態' }
      })
      .state('holidays.list', {
        url: '',
        templateUrl: 'modules/holidays/client/views/list-holidays.client.view.html',
        controller: 'HolidaysListController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '一覧' }
      })
      .state('holidays.create', {
        url: '/create',
        templateUrl: 'modules/holidays/client/views/form-holiday.client.view.html',
        controller: 'HolidaysController',
        controllerAs: 'vm',
        resolve: { holidayResolve: newHoliday },
        ncyBreadcrumb: { label: '追加' }
      })
      .state('holidays.edit', {
        url: '/:holidayId/edit',
        templateUrl: 'modules/holidays/client/views/form-holiday.client.view.html',
        controller: 'HolidaysController',
        controllerAs: 'vm',
        resolve: { holidayResolve: getHoliday },
        ncyBreadcrumb: { label: '編集' }
      })
      .state('holidays.view', {
        url: '/:holidayId',
        templateUrl: 'modules/holidays/client/views/view-holiday.client.view.html',
        controller: 'HolidaysController',
        controllerAs: 'vm',
        resolve: { holidayResolve: getHoliday },
        ncyBreadcrumb: { label: '詳細' }
      });
  }

  getHoliday.$inject = ['$stateParams', 'HolidaysService'];

  function getHoliday($stateParams, HolidaysService) {
    return HolidaysService.get({
      holidayId: $stateParams.holidayId
    }).$promise;
  }

  newHoliday.$inject = ['HolidaysService'];

  function newHoliday(HolidaysService) {
    return new HolidaysService();
  }
}());
