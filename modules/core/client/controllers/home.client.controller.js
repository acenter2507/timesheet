'use strict';

angular.module('core').controller('HomeController', ['$scope', 'WorkrestsApi',
  function ($scope, WorkrestsApi) {
    // This provides Authentication context.
    $scope.workrests = [];

    prepareWorkrests();
    function prepareWorkrests() {
      WorkrestsApi.getWorkrestsToday()
        .then(function (workrests) {
          console.log(workrests);
          $scope.workrests = workrests;
        })
        .catch(function (err) {
          console.log(err);
        });
    }
  }
]);
