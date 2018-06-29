'use strict';

angular.module('core').controller('HomeController', ['$scope', 'WorkrestsApi',
  function ($scope, WorkrestsApi) {
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
    vm.loadTexts = function () {
      for (var index = 0; index < 20; index++) {
        vm.texts.push({ time: new Date().getTime(), text: index });
      }
    };
  }
]);
