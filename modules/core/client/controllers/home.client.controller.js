'use strict';

angular.module('core').controller('HomeController', ['$scope', 'WorkrestsApi', '$timeout',
  function ($scope, WorkrestsApi, $timeout) {
    var vm = this;
    // This provides Authentication context.
    $scope.workrests = [];

    prepareWorkrests();
    function prepareWorkrests() {
      WorkrestsApi.getWorkrestsToday()
        .success(function (workrests) {
          $scope.workrests = workrests;
        });
    }
    vm.texts = [];
    $scope.glued = true;
    function addItem() {
      vm.texts.push({ text: new Date().getTime() });
      $timeout(addItem, 1000);
    }
    $timeout(addItem, 1000);
  }
]);
