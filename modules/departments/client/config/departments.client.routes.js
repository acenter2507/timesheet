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
        template: '<ui-view/>'
      })
      .state('departments.list', {
        url: '',
        templateUrl: 'modules/departments/client/views/list-departments.client.view.html',
        controller: 'DepartmentsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Departments List'
        }
      })
      .state('departments.create', {
        url: '/create',
        templateUrl: 'modules/departments/client/views/form-department.client.view.html',
        controller: 'DepartmentsController',
        controllerAs: 'vm',
        resolve: {
          departmentResolve: newDepartment
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Departments Create'
        }
      })
      .state('departments.edit', {
        url: '/:departmentId/edit',
        templateUrl: 'modules/departments/client/views/form-department.client.view.html',
        controller: 'DepartmentsController',
        controllerAs: 'vm',
        resolve: {
          departmentResolve: getDepartment
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Department {{ departmentResolve.name }}'
        }
      })
      .state('departments.view', {
        url: '/:departmentId',
        templateUrl: 'modules/departments/client/views/view-department.client.view.html',
        controller: 'DepartmentsController',
        controllerAs: 'vm',
        resolve: {
          departmentResolve: getDepartment
        },
        data: {
          pageTitle: 'Department {{ departmentResolve.name }}'
        }
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
