'use strict';

angular.module('core').controller('HomeController', ['$scope', 'WorkrestsApi',
  function ($scope, WorkrestsApi) {
    // This provides Authentication context.
    console.log($scope.currentTime);
  }
]);
