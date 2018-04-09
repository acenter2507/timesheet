// Workrests service used to communicate Workrests REST endpoints
(function () {
  'use strict';

  angular
    .module('workrests')
    .factory('WorkrestsService', WorkrestsService)
    .factory('WorkrestsApi', WorkrestsApi);

  WorkrestsService.$inject = ['$resource'];

  function WorkrestsService($resource) {
    return $resource('api/workrests/:workrestId', { workrestId: '@_id' }, {
      update: {
        method: 'PUT'
      }
    });
  }
  WorkrestsApi.$inject = ['$http'];
  function WorkrestsApi($http) {
    this.getRestOfCurrentUser = (condition, page) => {
      return $http.post('/api/workrests/owner', { condition: condition, page: page }, { ignoreLoadingBar: true });
    };
    this.getRestOfCurrentUserInRange = (start, end, userId) => {
      return $http.post('/api/workrests/owner_in_range', { start: start, end: end, userId: userId }, { ignoreLoadingBar: true });
    };
    this.getRestReview = (condition, page) => {
      return $http.post('/api/workrests/review', { condition: condition, page: page }, { ignoreLoadingBar: true });
    };
    this.approve = workrestId => {
      return $http.post('/api/workrests/' + workrestId + '/approve', { ignoreLoadingBar: true });
    };
    this.reject = (workrestId, data) => {
      return $http.post('/api/workrests/' + workrestId + '/reject', { data: data }, { ignoreLoadingBar: true });
    };
    this.request = workrestId => {
      return $http.post('/api/workrests/' + workrestId + '/request', null, { ignoreLoadingBar: true });
    };
    this.cancel = workrestId => {
      return $http.post('/api/workrests/' + workrestId + '/cancel', null, { ignoreLoadingBar: true });
    };
    this.deleteRequest = workrestId => {
      return $http.post('/api/workrests/' + workrestId + '/deleteRequest', null, { ignoreLoadingBar: true });
    };
    return this;
  }
}());
