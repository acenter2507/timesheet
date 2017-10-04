'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', 'Menus',
  function ($scope, $state, Menus) {
    // Expose view variables
    $scope.$state = $state;

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');
  }
]);
