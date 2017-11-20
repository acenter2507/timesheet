// Rests service used to communicate Rests REST endpoints
(function () {
  'use strict';

  angular
    .module('rests')
    .factory('RestsService', RestsService)
    .factory('RestsApi', RestsApi);

  RestsService.$inject = ['$resource'];

  function RestsService($resource) {
    return $resource('api/rests/:restId', { restId: '@_id' }, {
      update: {
        method: 'PUT'
      }
    });
  }
  RestsApi.$inject = ['$http'];
  function RestsApi($http) {
    this.getRestOfCurrentUser = (condition, page) => {
      return $http.post('/api/rests/owner', { condition: condition, page: page }, { ignoreLoadingBar: true });
    };
    this.getRestReview = (condition, page) => {
      return $http.post('/api/rests/review', { condition: condition, page: page }, { ignoreLoadingBar: true });
    };
    
    return this;
  }
}());
