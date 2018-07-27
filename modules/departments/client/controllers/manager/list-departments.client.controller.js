(function () {
  'use strict';

  angular
    .module('departments.admin')
    .controller('ManagerDepartmentsController', ManagerDepartmentsController);

  ManagerDepartmentsController.$inject = ['$scope', 'ManagerDepartmentsService', '$state'];

  function ManagerDepartmentsController($scope, ManagerDepartmentsService, $state) {
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
    vm.hanleSelectDepartment = function (department) {
      $state.go('manager.departments.view', { departmentId: department._id });
    };

  }
}());
