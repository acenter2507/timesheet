(function () {
  'use strict';

  angular
    .module('departments.admin')
    .controller('ManagerDepartmentsController', ManagerDepartmentsController);

  ManagerDepartmentsController.$inject = ['$scope', 'ManagerDepartmentsService'];

  function ManagerDepartmentsController($scope, ManagerDepartmentsService) {
    var vm = this;

    vm.departments = ManagerDepartmentsService.query();

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
