'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
  function ($resource) {
    return $resource('api/users', {}, {
      get: { ignoreLoadingBar: true },
      update: { method: 'PUT', ignoreLoadingBar: true },
      query: { ignoreLoadingBar: true }
    });
  }
]);
