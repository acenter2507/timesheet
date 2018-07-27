(function () {
  'use strict';

  angular
    .module('departments.admin')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('manager.departments', {
        abstract: true,
        url: '/departments',
        template: '<ui-view/>',
        ncyBreadcrumb: { label: '部署管理' }
      })
      .state('manager.departments.list', {
        url: '',
        templateUrl: 'modules/departments/client/views/manager/list-departments.client.view.html',
        controller: 'ManagerDepartmentsController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '部署一覧' }
      })
      .state('manager.departments.create', {
        url: '/create',
        templateUrl: 'modules/departments/client/views/manager/form-department.client.view.html',
        controller: 'ManagerDepartmentController',
        controllerAs: 'vm',
        resolve: { 　departmentResolve: newDepartment },
        ncyBreadcrumb: { label: '部署追加' }
      })
      .state('manager.departments.edit', {
        url: '/:departmentId/edit',
        templateUrl: 'modules/departments/client/views/manager/form-department.client.view.html',
        controller: 'ManagerDepartmentController',
        controllerAs: 'vm',
        resolve: { 　departmentResolve: getDepartment },
        ncyBreadcrumb: { label: '部署編集' }
      })
      .state('manager.departments.view', {
        url: '/:departmentId?action',
        templateUrl: 'modules/departments/client/views/manager/view-department.client.view.html',
        controller: 'ManagerDepartmentController',
        controllerAs: 'vm',
        resolve: { 　departmentResolve: getDepartment },
        ncyBreadcrumb: { label: '部署詳細' }
      });
  }

  getDepartment.$inject = ['$stateParams', 'ManagerDepartmentsService'];

  function getDepartment($stateParams, ManagerDepartmentsService) {
    return ManagerDepartmentsService.get({
      departmentId: $stateParams.departmentId
    }).$promise;
  }

  newDepartment.$inject = ['ManagerDepartmentsService'];

  function newDepartment(ManagerDepartmentsService) {
    return new ManagerDepartmentsService();
  }
}());
