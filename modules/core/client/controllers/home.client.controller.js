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
  }
]);
