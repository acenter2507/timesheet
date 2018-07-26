(function () {
  'use strict';

  angular
    .module('departments')
    .controller('DepartmentsListController', DepartmentsListController);

  DepartmentsListController.$inject = ['$scope', 'DepartmentsService'];

  function DepartmentsListController($scope, DepartmentsService) {
    var vm = this;

    vm.departments = DepartmentsService.query();

    vm.handleDeleteDepartment = function (department) {
      $scope.handleShowConfirm({
        message: department.name + 'を削除しますか？'
      }, function () {
        department.$remove();
        vm.departments = _.without(vm.departments, department);
      });
    };

  }
}());
