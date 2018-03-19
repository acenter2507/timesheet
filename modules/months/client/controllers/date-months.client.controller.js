(function () {
  'use strict';

  // Months controller
  angular
    .module('months')
    .controller('DateController', DateController);

  DateController.$inject = ['$scope', '$state', '$window', 'monthResolve', 'RestsApi', 'ngDialog'];

  function DateController($scope, $state, $window, month, RestsApi, ngDialog) {
  }
}());