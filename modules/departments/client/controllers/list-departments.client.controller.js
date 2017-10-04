(function () {
  'use strict';

  angular
    .module('departments')
    .controller('DepartmentsListController', DepartmentsListController);

  DepartmentsListController.$inject = ['DepartmentsService'];

  function DepartmentsListController(DepartmentsService) {
    var vm = this;

    vm.departments = DepartmentsService.query();
  }
}());
