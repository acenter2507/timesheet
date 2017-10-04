'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', 'Authentication',
  function ($scope, $state, $http, $location, Authentication) {

    // If user is signed in then redirect back home
    if ($scope.isLogged) {
      $location.path('/');
    }

    $scope.signin = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        return false;
      }

      $http.post('/api/auth/signin', $scope.credentials).success(function (res) {
        Authentication.user = res;
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (err) {
        $scope.handleShowToast(err.message, true);
      });
    };
  }
]);
