(function () {
  'use strict';

  angular
    .module('departments')
    .controller('DepartmentsListController', DepartmentsListController);

  DepartmentsListController.$inject = ['$scope', 'DepartmentsService'];

  function DepartmentsListController($scope, DepartmentsService, $stateParams) {
    var vm = this;

    vm.departments = DepartmentsService.query();

    vm.handleDeleteDepartment = department => {
      $scope.handleShowConfirm({
        message: department.name + 'を削除しますか？'
      }, () => {
        department.$remove();
        vm.departments = _.without(vm.departments, department);
      });
    };
  }
}());
