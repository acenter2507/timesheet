'use strict';

angular.module('core').controller('HomeController', ['$scope', 'WorkrestsApi',
  function ($scope, WorkrestsApi) {
    // This provides Authentication context.
    $scope.workrests = [];

    prepareWorkrests();
    function prepareWorkrests() {
      WorkrestsApi.getWorkrestsToday()
        .success(function (workrests) {
          $scope.workrests = workrests;
        });
    }
    $scope.texts = [];
    $scope.loadTexts = function() {
      for (var index = 0; index < 20; index++) {
        $scope.texts.push(index);
      }
    };
  }
]);
