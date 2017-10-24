(function () {
  'use strict';

  angular
    .module('departments')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('departments', {
        abstract: true,
        url: '/departments',
        template: '<ui-view/>',
        data: {
          pageTitle: 'Departments List'
        },
        ncyBreadcrumb: { label: '部署' }
      })
      .state('departments.list', {
        url: '',
        templateUrl: 'modules/departments/client/views/list-departments.client.view.html',
        controller: 'DepartmentsListController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '部署一覧' }
      })
      .state('departments.new', {
        url: '/new',
        templateUrl: 'modules/departments/client/views/input-department.client.view.html',
        controller: 'InputDepartmentController',
        controllerAs: 'vm',
        resolve: {
          departmentResolve: newDepartment
        },
        data: {
          roles: ['admin', 'accountant']
        },
        ncyBreadcrumb: { label: '部署追加' }
      })
      .state('departments.edit', {
        url: '/:departmentId/edit',
        templateUrl: 'modules/departments/client/views/input-department.client.view.html',
        controller: 'InputDepartmentController',
        controllerAs: 'vm',
        resolve: {
          departmentResolve: getDepartment
        },
        data: {
          roles: ['admin', 'accountant', 'manager']
        },
        ncyBreadcrumb: { label: '部署編集' }
      })
      .state('departments.view', {
        url: '/:departmentId?action',
        templateUrl: 'modules/departments/client/views/view-department.client.view.html',
        controller: 'DepartmentsController',
        controllerAs: 'vm',
        resolve: {
          departmentResolve: getDepartment
        },
        ncyBreadcrumb: { label: '部署詳細' }
      });
  }

  getDepartment.$inject = ['$stateParams', 'DepartmentsService'];

  function getDepartment($stateParams, DepartmentsService) {
    return DepartmentsService.get({
      departmentId: $stateParams.departmentId
    }).$promise;
  }

  newDepartment.$inject = ['DepartmentsService'];

  function newDepartment(DepartmentsService) {
    return new DepartmentsService();
  }
}());
