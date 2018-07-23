'use strict';

angular.module('core')
  .controller('ImagesViewController', ['$scope',
    function ($scope) {
      console.log($scope.images);
    }
  ]);
